using UnityEngine;

namespace Skybound.CameraSystem
{
    /// <summary>
    /// Decaying positional/rotational camera shake driven by Perlin noise (smooth, never
    /// jittery — important: we never want a "broken" looking jump). Applied as a local
    /// offset in LateUpdate after <see cref="CameraController"/> sets the base position, so
    /// the two compose cleanly. Trauma model: events add trauma, shake scales with trauma^2.
    /// </summary>
    [RequireComponent(typeof(UnityEngine.Camera))]
    public class CameraShake : MonoBehaviour
    {
        [SerializeField] private float _maxTranslation = 0.5f;
        [SerializeField] private float _maxRotation = 4f;
        [SerializeField] private float _frequency = 22f;
        [SerializeField] private float _decayPerSecond = 1.4f;

        private float _trauma;
        private float _seed;

        private void Awake() => _seed = Random.value * 100f;

        /// <summary>Add shake. <paramref name="amount"/> 0..1; capped at full trauma.</summary>
        public void Shake(float amount, float maxAmount = 1f)
        {
            _trauma = Mathf.Clamp(Mathf.Max(_trauma, amount), 0f, maxAmount);
        }

        private void LateUpdate()
        {
            if (_trauma <= 0f)
            {
                return;
            }

            float shake = _trauma * _trauma; // perceptually smoother falloff
            float time = Time.unscaledTime * _frequency;

            float offX = (Mathf.PerlinNoise(_seed, time) * 2f - 1f) * _maxTranslation * shake;
            float offY = (Mathf.PerlinNoise(_seed + 1f, time) * 2f - 1f) * _maxTranslation * shake;
            float rot = (Mathf.PerlinNoise(_seed + 2f, time) * 2f - 1f) * _maxRotation * shake;

            transform.localPosition += new Vector3(offX, offY, 0f);
            transform.localRotation *= Quaternion.Euler(0f, 0f, rot);

            _trauma = Mathf.Max(0f, _trauma - _decayPerSecond * Time.unscaledDeltaTime);
        }
    }
}
