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
    } catch (_) { /* storage blocked */ }
    return 'tasks';
  }

  function announce(backend) {
    window.__landmarkEngineBackend = backend;
    if (window.SignDiag && window.SignDiag.enabled) {
      window.SignDiag.event('engine', 'landmark_engine', { backend: backend });
    }
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

  async function create(config) {
    var onResults = config.onResults;
    var complexity = typeof config.complexity === 'number' ? config.complexity : 1;
    var pref = pickPreference();
    if (pref !== 'legacy') {
      try {
        var eng = await createTasksEngine(onResults);
        console.log('[LandmarkEngine] tasks-vision HolisticLandmarker active (GPU delegate)');
        announce(eng.backend);
        return eng;
      } catch (e) {
        console.warn('[LandmarkEngine] tasks-vision unavailable — falling back to legacy WASM:', e);
      }
    }
    var legacy = createLegacyEngine(onResults, complexity);
    console.log('[LandmarkEngine] legacy Holistic active (CPU WASM, complexity ' + complexity + ')');
    announce(legacy.backend);
    return legacy;
  }

  window.LandmarkEngine = { create: create };
})();
