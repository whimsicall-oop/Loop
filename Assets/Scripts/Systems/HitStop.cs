using System.Collections;
using Skybound.Core;
using UnityEngine;

namespace Skybound.Systems
{
    /// <summary>
    /// Global "hit-stop" / freeze-frame service. A few milliseconds of frozen time on
    /// impact is one of the cheapest, highest-impact game-feel tools — it sells weight
    /// and makes hits read. Uses unscaled time so the freeze itself is reliable, and
    /// is reentrant-safe (a stronger freeze overrides a weaker one in progress).
    /// </summary>
    public class HitStop : Singleton<HitStop>
    {
        [SerializeField, Range(0f, 0.3f)] private float _maxDuration = 0.12f;

        private Coroutine _routine;
        private float _restoreScale = 1f;

        /// <summary>Freeze for <paramref name="seconds"/>, optionally easing to a slow-mo factor.</summary>
        public void Freeze(float seconds, float timeScaleDuringFreeze = 0f)
        {
            seconds = Mathf.Min(seconds, _maxDuration);

            if (_routine != null)
            {
                StopCoroutine(_routine);
            }
            else
            {
                _restoreScale = Time.timeScale;
            }

            _routine = StartCoroutine(FreezeRoutine(seconds, timeScaleDuringFreeze));
        }

        private IEnumerator FreezeRoutine(float seconds, float scale)
        {
            Time.timeScale = scale;
            yield return new WaitForSecondsRealtime(seconds);
            Time.timeScale = GameStateMachine.Instance.Current == GameState.Paused ? 0f : _restoreScale;
            _routine = null;
        }
    }
}
