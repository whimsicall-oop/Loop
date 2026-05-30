using System.Collections.Generic;
using Skybound.Core;
using Skybound.Systems;
using UnityEngine;

namespace Skybound.VFX
{
    /// <summary>
    /// Pooled, id-addressed VFX spawner so gameplay code requests effects by name
    /// ("landing_dust", "dash_trail", "coin_burst", "enemy_death") without holding prefab
    /// references or allocating. Each effect auto-returns to its pool after its lifetime,
    /// keeping the 60 FPS budget intact under heavy particle load on mobile/console.
    /// </summary>
    public class VfxManager : Singleton<VfxManager>
    {
        [System.Serializable]
        public struct Entry
        {
            public string Id;
            public PooledVfx Prefab;
            public int Prewarm;
        }

        [SerializeField] private Entry[] _entries;

        private readonly Dictionary<string, ObjectPool<PooledVfx>> _pools =
            new Dictionary<string, ObjectPool<PooledVfx>>();

        protected override void OnSingletonAwake()
        {
            foreach (var e in _entries)
            {
                if (e.Prefab != null && !string.IsNullOrEmpty(e.Id))
                {
                    _pools[e.Id] = new ObjectPool<PooledVfx>(e.Prefab, Mathf.Max(1, e.Prewarm), transform);
                }
            }
        }

        /// <summary>Spawn a one-shot effect by id. Optionally scale/tint (e.g. landing dust by impact).</summary>
        public void Spawn(string id, Vector3 position, Quaternion rotation = default, float scale = 1f, Color? tint = null)
        {
            if (!_pools.TryGetValue(id, out var pool))
            {
                return;
            }

            PooledVfx fx = pool.Get(position, rotation == default ? Quaternion.identity : rotation);
            fx.transform.localScale = Vector3.one * scale;
            fx.Play(tint, () => pool.Release(fx));
        }
    }
}
