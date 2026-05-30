using System.Collections;
using System.Collections.Generic;
using Skybound.Core;
using UnityEngine;
using UnityEngine.Audio;

namespace Skybound.Audio
{
    /// <summary>
    /// Central audio service: pooled one-shot SFX (no AudioSource churn), an adaptive music
    /// system with cross-faded stems for layering (calm → combat → boss), and routing through
    /// an <see cref="AudioMixer"/> so settings can expose Master/Music/SFX/Ambience volumes.
    ///
    /// SFX are addressed by string id resolved against a <see cref="SoundBank"/>, which keeps
    /// gameplay code free of direct AudioClip references and lets sound designers reassign
    /// clips without touching scripts.
    /// </summary>
    public class AudioManager : Singleton<AudioManager>
    {
        [SerializeField] private AudioMixer _mixer;
        [SerializeField] private SoundBank _bank;
        [SerializeField] private int _sfxVoices = 16;
        [SerializeField] private float _musicFadeTime = 1.5f;

        [SerializeField] private AudioMixerGroup _sfxGroup;
        [SerializeField] private AudioMixerGroup _musicGroup;
        [SerializeField] private AudioMixerGroup _ambienceGroup;

        private readonly List<AudioSource> _sfxPool = new List<AudioSource>();
        private int _voiceCursor;

        // Two music sources for seamless cross-fade; "layers" sit on additional sources.
        private AudioSource _musicA;
        private AudioSource _musicB;
        private bool _usingA = true;
        private readonly Dictionary<string, AudioSource> _activeLayers = new Dictionary<string, AudioSource>();

        protected override void OnSingletonAwake()
        {
            for (int i = 0; i < _sfxVoices; i++)
            {
                _sfxPool.Add(CreateSource(_sfxGroup, loop: false));
            }

            _musicA = CreateSource(_musicGroup, loop: true);
            _musicB = CreateSource(_musicGroup, loop: true);
        }

        private AudioSource CreateSource(AudioMixerGroup group, bool loop)
        {
            var go = new GameObject(group != null ? group.name + "_voice" : "voice");
            go.transform.SetParent(transform);
            var src = go.AddComponent<AudioSource>();
            src.playOnAwake = false;
            src.loop = loop;
            src.outputAudioMixerGroup = group;
            return src;
        }

        // --- SFX ---------------------------------------------------------------
        /// <summary>Fire a one-shot by id. Round-robins voices; supports pitch variation.</summary>
        public void PlaySfx(string id, Vector3? position = null, float volumeScale = 1f)
        {
            if (_bank == null || !_bank.TryGet(id, out SoundBank.Entry entry))
            {
                return;
            }

            AudioSource src = _sfxPool[_voiceCursor];
            _voiceCursor = (_voiceCursor + 1) % _sfxPool.Count;

            src.transform.position = position ?? Vector3.zero;
            src.spatialBlend = position.HasValue ? 1f : 0f;
            src.clip = entry.RandomClip();
            src.volume = entry.Volume * volumeScale;
            src.pitch = entry.RandomPitch();
            src.Play();
        }

        // --- Music -------------------------------------------------------------
        /// <summary>Cross-fade the main music track.</summary>
        public void PlayMusic(AudioClip clip, float volume = 1f)
        {
            if (clip == null)
            {
                return;
            }

            AudioSource from = _usingA ? _musicA : _musicB;
            AudioSource to = _usingA ? _musicB : _musicA;
            _usingA = !_usingA;

            to.clip = clip;
            to.volume = 0f;
            to.Play();
            StartCoroutine(CrossFade(from, to, volume));
        }

        /// <summary>Fade an additive layer (e.g. combat percussion) in or out over the base track.</summary>
        public void SetMusicLayer(string layerId, AudioClip clip, bool active, float targetVolume = 1f)
        {
            if (!_activeLayers.TryGetValue(layerId, out AudioSource src))
            {
                if (!active) return;
                src = CreateSource(_musicGroup, loop: true);
                src.clip = clip;
                // Sync to the main track so layers stay phase-aligned.
                src.timeSamples = (_usingA ? _musicB : _musicA).timeSamples;
                src.Play();
                _activeLayers[layerId] = src;
            }

            StartCoroutine(FadeTo(src, active ? targetVolume : 0f, _musicFadeTime));
        }

        public void SetMixerVolume(string exposedParam, float linear01)
        {
            if (_mixer != null)
            {
                // Convert linear slider to decibels; clamp to avoid -inf at 0.
                float db = Mathf.Log10(Mathf.Max(linear01, 0.0001f)) * 20f;
                _mixer.SetFloat(exposedParam, db);
            }
        }

        private IEnumerator CrossFade(AudioSource from, AudioSource to, float toVolume)
        {
            float t = 0f;
            float fromStart = from.volume;
            while (t < _musicFadeTime)
            {
                t += Time.unscaledDeltaTime;
                float k = t / _musicFadeTime;
                from.volume = Mathf.Lerp(fromStart, 0f, k);
                to.volume = Mathf.Lerp(0f, toVolume, k);
                yield return null;
            }
            from.Stop();
            to.volume = toVolume;
        }

        private static IEnumerator FadeTo(AudioSource src, float target, float duration)
        {
            float start = src.volume;
            float t = 0f;
            while (t < duration)
            {
                t += Time.unscaledDeltaTime;
                src.volume = Mathf.Lerp(start, target, t / duration);
                yield return null;
            }
            src.volume = target;
        }
    }
}
