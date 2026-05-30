using System.Collections;
using UnityEngine;

namespace Skybound.Environment
{
    /// <summary>
    /// Drives dynamic weather (Clear, Rain, Storm, Snow, Fog, Wind) with smooth transitions.
    /// Each weather type maps to particle emission rates, fog density, wind force, and an
    /// ambience loop; transitions lerp these over time so weather never pops. Wind force is
    /// exposed for gameplay (drifting platforms, the Wind power, projectile arcs).
    /// </summary>
    public class WeatherSystem : MonoBehaviour
    {
        public enum Weather { Clear, Rain, Storm, Snow, Fog }

        [System.Serializable]
        public struct Profile
        {
            public Weather Type;
            [Range(0f, 1f)] public float Precipitation;
            [Range(0f, 1f)] public float FogDensity;
            public float WindForce;
            public string AmbienceSfxId;
            public Color Tint;
        }

        [SerializeField] private Profile[] _profiles;
        [SerializeField] private ParticleSystem _rainSystem;
        [SerializeField] private ParticleSystem _snowSystem;
        [SerializeField] private float _transitionTime = 4f;

        private Profile _current;
        private float _windCurrent;

        /// <summary>Horizontal wind force in world units; read by gameplay each frame.</summary>
        public float Wind => _windCurrent;
        public Weather CurrentWeather => _current.Type;

        private void Awake()
        {
            if (_profiles != null && _profiles.Length > 0)
            {
                _current = _profiles[0];
                ApplyImmediate(_current);
            }
        }

        public void TransitionTo(Weather weather)
        {
            foreach (var p in _profiles)
            {
                if (p.Type == weather)
                {
                    StopAllCoroutines();
                    StartCoroutine(Blend(_current, p));
                    return;
                }
            }
        }

        private IEnumerator Blend(Profile from, Profile to)
        {
            float t = 0f;
            while (t < _transitionTime)
            {
                t += Time.deltaTime;
                float k = t / _transitionTime;
                SetRain(Mathf.Lerp(from.Precipitation, to.Precipitation, k), to.Type);
                SetSnow(Mathf.Lerp(from.Type == Weather.Snow ? 1f : 0f, to.Type == Weather.Snow ? 1f : 0f, k));
                RenderSettings.fogDensity = Mathf.Lerp(from.FogDensity, to.FogDensity, k) * 0.1f;
                _windCurrent = Mathf.Lerp(from.WindForce, to.WindForce, k);
                yield return null;
            }

            _current = to;
            ApplyImmediate(to);
        }

        private void ApplyImmediate(Profile p)
        {
            SetRain(p.Precipitation, p.Type);
            SetSnow(p.Type == Weather.Snow ? 1f : 0f);
            RenderSettings.fogDensity = p.FogDensity * 0.1f;
            _windCurrent = p.WindForce;

            if (Skybound.Audio.AudioManager.HasInstance && !string.IsNullOrEmpty(p.AmbienceSfxId))
            {
                Skybound.Audio.AudioManager.Instance.PlaySfx(p.AmbienceSfxId);
            }
        }

        private void SetRain(float intensity, Weather type)
        {
            if (_rainSystem == null) return;
            var emission = _rainSystem.emission;
            emission.rateOverTime = intensity * (type == Weather.Storm ? 900f : 500f);
        }

        private void SetSnow(float intensity)
        {
            if (_snowSystem == null) return;
            var emission = _snowSystem.emission;
            emission.rateOverTime = intensity * 300f;
        }
    }
}
