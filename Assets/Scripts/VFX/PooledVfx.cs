using System;
using System.Collections;
using UnityEngine;

namespace Skybound.VFX
{
    /// <summary>
    /// Wrapper on a ParticleSystem (or animated effect) that plays once and signals the
    /// pool when finished, instead of Destroy. Optional tint recolours the start colour so
    /// one prefab serves many themes (e.g. a single hit-spark tinted per damage element).
    /// </summary>
    [RequireComponent(typeof(ParticleSystem))]
    public class PooledVfx : MonoBehaviour
    {
        private ParticleSystem _ps;
        private Action _onComplete;

        private void Awake() => _ps = GetComponent<ParticleSystem>();

        public void Play(Color? tint, Action onComplete)
        {
            _onComplete = onComplete;

            if (tint.HasValue)
            {
                var main = _ps.main;
                main.startColor = tint.Value;
            }

            _ps.Clear();
            _ps.Play();
            StartCoroutine(WaitThenRelease());
        }

        private IEnumerator WaitThenRelease()
        {
            // Lifetime = duration + max particle lifetime, so trails finish cleanly.
            var main = _ps.main;
            float life = main.duration + main.startLifetime.constantMax;
            yield return new WaitForSeconds(life);
            _onComplete?.Invoke();
        }
    }
}
