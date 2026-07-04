/* LandmarkEngine — one place that decides HOW landmarks are produced.
 *
 * Preferred backend: @mediapipe/tasks-vision HolisticLandmarker with the GPU
 * delegate (WebGL) — an order of magnitude faster than the legacy CPU-WASM
 * Holistic solution on typical hardware (the legacy path measured 120-190ms
 * per frame ≈ 6-8fps on the project owner's machine; the face + hand models
 * dominate that cost and have no lite variant, so CPU-side tuning is capped).
 *
 * Fallback backend: the legacy @mediapipe/holistic solution (already loaded
 * via its own <script>), exactly as configured before this engine existed.
 * Any failure in the tasks path — module load, WASM init, model fetch, GPU
 * context — falls back automatically. Force a backend for A/B testing with
 * ?engine=legacy / ?engine=tasks or localStorage 'landmark-engine'.
 *
 * CONTRACT (identical for both backends — pages never know the difference):
 * the onResults callback receives the LEGACY result shape:
 *   { image: {width, height},
 *     faceLandmarks?:  [468 x {x,y,z}],
 *     poseLandmarks?:  [33  x {x,y,z}],
 *     leftHandLandmarks?/rightHandLandmarks?: [21 x {x,y,z}] }
 * - Coordinates are normalized, UNMIRRORED (both backends process the raw
 *   frame — the recognition models were trained on unmirrored landmarks; the
 *   selfie view is CSS-only).
 * - left/right hands are pose-driven (anatomical) in both pipelines.
 * - tasks-vision face output may carry 478 points (468 mesh + 10 iris,
 *   appended at the end); the shim slices to the first 468 so the payload
 *   matches the GISLR training contract exactly.
 * - Absent parts are undefined (the wire layer turns them into nulls → NaN
 *   server-side for ASL, zeros for ArSL — unchanged).
 */
(function () {
  'use strict';

  var TASKS_BASE = '/static/vendor/mediapipe/tasks-vision';
  var LEGACY_BASE = '/static/vendor/mediapipe/holistic';

  function pickPreference() {
    try {
      var q = new URLSearchParams(location.search).get('engine');
      if (q === 'legacy' || q === 'tasks') return q;
      var ls = localStorage.getItem('landmark-engine');
      if (ls === 'legacy' || ls === 'tasks') return ls;
      // Auto-benchmark verdict from THIS browser session (see the facade
      // below): on machines where the "GPU" delegate lands on software WebGL,
      // tasks measured SLOWER than legacy WASM (195ms vs 137ms per frame on
      // the owner's machine) — once measured, later engine creations in the
      // same session skip the slow path. Session-scoped on purpose: drivers,
      // browsers and machines change, so every new session re-probes.
      var auto = sessionStorage.getItem('landmark-engine-auto');
      if (auto === 'legacy') return 'legacy';
    } catch (_) { /* storage blocked */ }
    return 'tasks';
  }

  function announce(backend) {
    window.__landmarkEngineBackend = backend;
    if (window.SignDiag && window.SignDiag.enabled) {
      window.SignDiag.event('engine', 'landmark_engine', { backend: backend });
    }
  }

  function detectGlRenderer() {
    // The UNMASKED renderer names the actual adapter (e.g. "ANGLE (NVIDIA,
    // NVIDIA GeForce GTX 1050 Ti Direct3D11 ...)" vs "SwiftShader"). The
    // string MediaPipe logs internally is the masked "WebKit WebGL", which
    // cannot distinguish hardware from software rendering.
    try {
      var c = document.createElement('canvas');
      var gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return 'none';
      var ext = gl.getExtension('WEBGL_debug_renderer_info');
      var r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return String(r || 'unknown');
    } catch (_) { return 'unknown'; }
  }

  function shimImage(source) {
    // The legacy result exposed results.image.{width,height} (used for canvas
    // sizing). A raw <video> element's .width attribute is often 0 — report
    // the actual frame dimensions instead.
    return {
      width: source.videoWidth || source.width || 0,
      height: source.videoHeight || source.height || 0,
    };
  }

  function shimResult(r, source) {
    var face = (r.faceLandmarks && r.faceLandmarks[0]) || null;
    if (face && face.length > 468) face = face.slice(0, 468); // drop iris points
    return {
      image: shimImage(source),
      faceLandmarks: face || undefined,
      poseLandmarks: (r.poseLandmarks && r.poseLandmarks[0]) || undefined,
      leftHandLandmarks: (r.leftHandLandmarks && r.leftHandLandmarks[0]) || undefined,
      rightHandLandmarks: (r.rightHandLandmarks && r.rightHandLandmarks[0]) || undefined,
    };
  }

  async function createTasksEngine(onResults) {
    var mod = await import(TASKS_BASE + '/vision_bundle.mjs');
    var fileset = await mod.FilesetResolver.forVisionTasks(TASKS_BASE + '/wasm');
    var landmarker = await mod.HolisticLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: TASKS_BASE + '/holistic_landmarker.task',
        // GPU (WebGL) delegate; tasks-vision falls back to its own CPU path
        // internally if the context can't be created — still faster WASM than
        // the legacy solution.
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      // All detection/presence confidences default to 0.5 — the same operating
      // point the legacy configuration used.
    });

    var lastTs = 0;
    return {
      backend: 'tasks-gpu',
      send: function (frame) {
        try {
          // detectForVideo requires a strictly increasing timestamp.
          var ts = performance.now();
          if (ts <= lastTs) ts = lastTs + 0.001;
          lastTs = ts;
          var result = landmarker.detectForVideo(frame.image, ts);
          onResults(shimResult(result, frame.image));
          return Promise.resolve();
        } catch (e) {
          return Promise.reject(e);
        }
      },
      setOptions: function () { /* no complexity knob on the GPU path */ },
      close: function () { try { landmarker.close(); } catch (_) {} },
    };
  }

  function createLegacyEngine(onResults, complexity) {
    if (!window.Holistic) throw new Error('legacy Holistic script not loaded');
    var h = new window.Holistic({
      locateFile: function (file) { return LEGACY_BASE + '/' + file; },
    });
    h.setOptions({
      modelComplexity: complexity,
      // selfieMode MUST stay false — the models were trained on unmirrored
      // landmarks (see scripts/model_harness.py mirror experiments).
      selfieMode: false,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    h.onResults(onResults);
    return {
      backend: 'legacy-wasm',
      send: function (frame) { return h.send(frame); },
      setOptions: function (opts) { try { h.setOptions(opts); } catch (_) {} },
      close: function () { try { h.close(); } catch (_) {} },
    };
  }

  // Measure, don't assume: "GPU delegate" can land on SOFTWARE WebGL
  // (blocklisted/weak GPUs, VMs), where tasks-vision is SLOWER than the
  // legacy WASM path. The facade times real video frames and hot-swaps to
  // legacy once the verdict is in; on healthy GPUs (5-40ms/frame) it never
  // triggers. Explicit ?engine=/localStorage choices bypass all of this.
  var WARMUP_FRAMES = 12;         // GPU delegates JIT-compile shaders on the first
                                  // real frames (100-500ms each even on strong GPUs) —
                                  // sampling those would condemn a healthy GPU.
  var SWAP_AFTER_SAMPLES = 30;    // ~4-6s of live video after warmup
  var SWAP_THRESHOLD_MS = 150;    // legacy CPU measured 120-140ms on the slowest machine so far

  async function create(config) {
    var onResults = config.onResults;
    var complexity = typeof config.complexity === 'number' ? config.complexity : 1;
    var pref = pickPreference();

    var renderer = window.__glRenderer;
    if (!renderer) {
      renderer = detectGlRenderer();
      window.__glRenderer = renderer;
      console.log('[LandmarkEngine] WebGL renderer:', renderer);
    }
    // Software rasterizers (SwiftShader/llvmpipe) make the "GPU" delegate
    // slower than legacy WASM — skip the doomed 5s benchmark entirely and go
    // straight to legacy. Fix on the user's side: enable hardware
    // acceleration in the browser + update the GPU driver; a hardware
    // renderer string here means the GPU backend will be used again.
    var softwareGl = /swiftshader|software|llvmpipe|basic render/i.test(renderer);
    if (softwareGl) {
      console.warn('[LandmarkEngine] software WebGL detected (' + renderer + ') — using legacy WASM. ' +
        'Enable hardware acceleration (chrome://settings/system) and update the GPU driver to unlock the GPU backend.');
    }

    var impl = null;
    if (pref !== 'legacy' && !softwareGl) {
      try {
        impl = await createTasksEngine(onResults);
        console.log('[LandmarkEngine] tasks-vision HolisticLandmarker active (GPU delegate)');
      } catch (e) {
        console.warn('[LandmarkEngine] tasks-vision unavailable — falling back to legacy WASM:', e);
      }
    }
    if (!impl) {
      impl = createLegacyEngine(onResults, complexity);
      console.log('[LandmarkEngine] legacy Holistic active (CPU WASM, complexity ' + complexity + ')');
    }
    announce(impl.backend);

    var samples = [];
    var warmupLeft = WARMUP_FRAMES;
    var swapping = false;
    var verdictLogged = false;

    var facade = {
      get backend() { return impl.backend; },
      send: function (frame) {
        // Benchmark only the tasks backend, only on real video frames (the
        // blank pre-warm canvas takes a cheap no-person path), and only
        // AFTER the shader-JIT warmup frames.
        if (impl.backend === 'tasks-gpu' && !swapping && !verdictLogged &&
            frame && frame.image && frame.image.videoWidth) {
          if (warmupLeft > 0) { warmupLeft--; return impl.send(frame); }
          var t0 = performance.now();
          var p = impl.send(frame);
          return p.then(function (r) {
            samples.push(performance.now() - t0);
            if (samples.length >= SWAP_AFTER_SAMPLES) {
              var sorted = samples.slice().sort(function (a, b) { return a - b; });
              var median = sorted[Math.floor(sorted.length / 2)];
              samples.length = 0;
              verdictLogged = true;
              console.log('[LandmarkEngine] tasks-vision steady-state median: ' +
                Math.round(median) + 'ms/frame (post-warmup)');
              if (window.SignDiag && window.SignDiag.enabled) {
                window.SignDiag.event('engine', 'landmark_engine_benchmark',
                  { backend: 'tasks-gpu', medianMs: Math.round(median) });
              }
              if (median > SWAP_THRESHOLD_MS) swapToLegacy(median);
            }
            return r;
          });
        }
        return impl.send(frame);
      },
      setOptions: function (opts) { impl.setOptions(opts); },
      close: function () { impl.close(); },
    };

    async function swapToLegacy(medianMs) {
      swapping = true;
      try {
        var legacy = createLegacyEngine(onResults, complexity);
        var old = impl;
        impl = legacy;
        try { old.close(); } catch (_) {}
        try { sessionStorage.setItem('landmark-engine-auto', 'legacy'); } catch (_) {}
        announce(impl.backend);
        if (window.SignDiag && window.SignDiag.enabled) {
          window.SignDiag.event('engine', 'landmark_engine_swap',
            { to: 'legacy-wasm', tasksMedianMs: Math.round(medianMs) });
        }
        console.warn('[LandmarkEngine] tasks-vision measured ' + Math.round(medianMs) +
          'ms/frame on this machine (software GL?) — swapped to legacy WASM, which benchmarked faster here.');
      } catch (e) {
        console.error('[LandmarkEngine] backend swap failed; staying on tasks:', e);
        swapping = false; // allow a later retry
        return;
      }
    }

    return facade;
  }

  window.LandmarkEngine = { create: create };
})();
