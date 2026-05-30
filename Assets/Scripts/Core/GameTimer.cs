using UnityEngine;

namespace Skybound.Core
{
    /// <summary>
    /// Lightweight countdown timer used pervasively by movement (coyote time, jump buffer,
    /// dash cooldowns) and combat (i-frames, hit-stop). Operates on unscaled or scaled time.
    /// Value semantics keep it allocation-free and trivially serializable for debugging.
    /// </summary>
    [System.Serializable]
    public struct GameTimer
    {
        [SerializeField] private float _remaining;
        [SerializeField] private float _duration;

        public float Remaining => _remaining;
        public float Duration => _duration;

        /// <summary>True while the timer still has time left.</summary>
        public bool IsRunning => _remaining > 0f;

        /// <summary>Normalized progress 0..1 (1 = just started, 0 = finished).</summary>
        public float Normalized => _duration > 0f ? Mathf.Clamp01(_remaining / _duration) : 0f;

        public GameTimer(float duration)
        {
            _duration = duration;
            _remaining = 0f;
        }

        /// <summary>Arm the timer for <paramref name="duration"/> seconds.</summary>
        public void Start(float duration)
        {
            _duration = duration;
            _remaining = duration;
        }

        /// <summary>Re-arm using the previously configured duration.</summary>
        public void Restart() => _remaining = _duration;

        public void Stop() => _remaining = 0f;

        /// <summary>Advance the timer. Returns true on the frame it transitions to finished.</summary>
        public bool Tick(float deltaTime)
        {
            if (_remaining <= 0f)
            {
                return false;
            }

            _remaining -= deltaTime;
            if (_remaining <= 0f)
            {
                _remaining = 0f;
                return true;
            }

            return false;
        }
    }
}
