using System.Collections.Generic;
using UnityEngine;

namespace Skybound.Audio
{
    /// <summary>
    /// String-id → clip(s) database. Multiple clips per id enable randomized variation
    /// (footsteps, hits) so repeated sounds never feel robotic; per-entry pitch/volume
    /// ranges add further organic variance. Authored by sound designers, referenced by id.
    /// </summary>
    [CreateAssetMenu(menuName = "Skybound/Audio/Sound Bank", fileName = "SoundBank")]
    public class SoundBank : ScriptableObject
    {
        [System.Serializable]
        public class Entry
        {
            public string Id;
            public AudioClip[] Clips;
            [Range(0f, 1f)] public float Volume = 1f;
            public Vector2 PitchRange = new Vector2(0.96f, 1.04f);

            public AudioClip RandomClip()
            {
                if (Clips == null || Clips.Length == 0) return null;
                return Clips[Random.Range(0, Clips.Length)];
            }

            public float RandomPitch() => Random.Range(PitchRange.x, PitchRange.y);
        }

        [SerializeField] private List<Entry> _entries = new List<Entry>();

        private Dictionary<string, Entry> _map;

        public bool TryGet(string id, out Entry entry)
        {
            if (_map == null)
            {
                _map = new Dictionary<string, Entry>();
                foreach (var e in _entries)
                {
                    if (!string.IsNullOrEmpty(e.Id)) _map[e.Id] = e;
                }
            }

            return _map.TryGetValue(id, out entry);
        }
    }
}
