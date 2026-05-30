using System;
using UnityEngine;

namespace Skybound.Environment
{
    /// <summary>
    /// Seamless time-of-day driver for a 2D world. Evaluates a normalized day phase (0..1)
    /// and feeds gradient/curve-authored sky colour, ambient light colour, and a global
    /// light's intensity & angle. Designers author the look entirely with gradients and
    /// curves — no code edits to retune dawn/dusk. Emits <see cref="PhaseChanged"/> so
    /// gameplay (nocturnal enemies, shop hours) can react to Day/Night boundaries.
    /// </summary>
    public class DayNightCycle : MonoBehaviour
    {
        public enum Phase { Dawn, Day, Dusk, Night }

        [Header("Cycle")]
        [Tooltip("Real seconds for a full 24h cycle. 0 freezes time (use SetTime).")]
        [SerializeField] private float _dayLengthSeconds = 600f;
        [SerializeField, Range(0f, 1f)] private float _time = 0.3f;

        [Header("Look (sampled by normalized time 0..1)")]
        [SerializeField] private Gradient _skyTop;
        [SerializeField] private Gradient _skyHorizon;
        [SerializeField] private Gradient _ambientColor;
        [SerializeField] private AnimationCurve _sunIntensity = AnimationCurve.EaseInOut(0, 0, 0.5f, 1f);

        [Header("Targets")]
        [SerializeField] private Light _globalLight; // URP 2D: assign the Global Light 2D's host
        [SerializeField] private Material _skyMaterial;

        private Phase _phase = Phase.Day;
        public event Action<Phase> PhaseChanged;
        public float NormalizedTime => _time;

        private static readonly int SkyTopId = Shader.PropertyToID("_SkyTop");
        private static readonly int SkyHorizonId = Shader.PropertyToID("_SkyHorizon");

        private void Update()
        {
            if (_dayLengthSeconds > 0f)
            {
                _time = Mathf.Repeat(_time + Time.deltaTime / _dayLengthSeconds, 1f);
            }

            Apply();
        }

        public void SetTime(float normalized)
        {
            _time = Mathf.Repeat(normalized, 1f);
            Apply();
        }

        private void Apply()
        {
            if (_skyMaterial != null)
            {
                _skyMaterial.SetColor(SkyTopId, _skyTop.Evaluate(_time));
                _skyMaterial.SetColor(SkyHorizonId, _skyHorizon.Evaluate(_time));
            }

            RenderSettings.ambientLight = _ambientColor.Evaluate(_time);

            if (_globalLight != null)
            {
                _globalLight.intensity = _sunIntensity.Evaluate(_time);
                _globalLight.color = _skyHorizon.Evaluate(_time);
            }

            UpdatePhase();
        }

        private void UpdatePhase()
        {
            Phase next =
                _time < 0.22f ? Phase.Night :
                _time < 0.30f ? Phase.Dawn :
                _time < 0.72f ? Phase.Day :
                _time < 0.82f ? Phase.Dusk : Phase.Night;

            if (next != _phase)
            {
                _phase = next;
                PhaseChanged?.Invoke(_phase);
            }
        }
    }
}
