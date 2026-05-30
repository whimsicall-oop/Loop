using UnityEngine;

namespace Skybound.Core
{
    /// <summary>
    /// Generic, lazily-instantiated MonoBehaviour singleton.
    /// Survives scene loads when <see cref="Persistent"/> is true.
    /// Designed to be cheap and predictable: no reflection, no allocation on access.
    /// </summary>
    public abstract class Singleton<T> : MonoBehaviour where T : Singleton<T>
    {
        private static T _instance;
        private static bool _isQuitting;

        /// <summary>Override to false for managers that should be re-created per scene.</summary>
        protected virtual bool Persistent => true;

        public static bool HasInstance => _instance != null;

        public static T Instance
        {
            get
            {
                if (_isQuitting)
                {
                    return null;
                }

                if (_instance == null)
                {
                    _instance = FindObjectOfType<T>();
                    if (_instance == null)
                    {
                        var go = new GameObject($"[{typeof(T).Name}]");
                        _instance = go.AddComponent<T>();
                    }
                }

                return _instance;
            }
        }

        protected virtual void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }

            _instance = (T)this;

            if (Persistent && transform.parent == null)
            {
                DontDestroyOnLoad(gameObject);
            }

            OnSingletonAwake();
        }

        /// <summary>Initialization hook that runs only for the surviving instance.</summary>
        protected virtual void OnSingletonAwake() { }

        protected virtual void OnApplicationQuit()
        {
            _isQuitting = true;
        }

        protected virtual void OnDestroy()
        {
            if (_instance == this)
            {
                _instance = null;
            }
        }
    }
}
