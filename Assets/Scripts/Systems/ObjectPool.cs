using System.Collections.Generic;
using UnityEngine;

namespace Skybound.Systems
{
    /// <summary>
    /// Minimal, allocation-conscious component pool. Used for projectiles, VFX bursts,
    /// damage-number popups and coin pickups — anything spawned frequently. Pooling is a
    /// core performance requirement (no GC spikes on a 60 FPS budget across mobile/console).
    /// </summary>
    public class ObjectPool<T> where T : Component
    {
        private readonly T _prefab;
        private readonly Transform _parent;
        private readonly Stack<T> _free = new Stack<T>();

        public ObjectPool(T prefab, int prewarm, Transform parent = null)
        {
            _prefab = prefab;
            _parent = parent;
            for (int i = 0; i < prewarm; i++)
            {
                _free.Push(CreateInstance());
            }
        }

        private T CreateInstance()
        {
            T instance = Object.Instantiate(_prefab, _parent);
            instance.gameObject.SetActive(false);
            return instance;
        }

        public T Get(Vector3 position, Quaternion rotation)
        {
            T instance = _free.Count > 0 ? _free.Pop() : CreateInstance();
            Transform t = instance.transform;
            t.SetPositionAndRotation(position, rotation);
            instance.gameObject.SetActive(true);
            return instance;
        }

        public void Release(T instance)
        {
            instance.gameObject.SetActive(false);
            _free.Push(instance);
        }
    }
}
