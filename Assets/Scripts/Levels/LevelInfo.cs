using UnityEngine;

namespace Skybound.Levels
{
    /// <summary>
    /// Scene-level metadata + camera bounds. Sets the static <see cref="CurrentLevelId"/>
    /// that checkpoints and save logic reference, and pushes the confiner bounds to the
    /// camera so it never shows out-of-level space.
    /// </summary>
    public class LevelInfo : MonoBehaviour
    {
        [SerializeField] private string _levelId = "EV_01";
        [SerializeField] private string _displayName = "Verdant Threshold";
        [SerializeField] private Bounds _cameraBounds = new Bounds(Vector3.zero, new Vector3(60, 30, 1));
        [SerializeField] private string _musicTrackId;

        public static string CurrentLevelId { get; private set; } = "EV_01";
        public string DisplayName => _displayName;
        public Bounds CameraBounds => _cameraBounds;

        private void Awake()
        {
            CurrentLevelId = _levelId;

            var cam = FindObjectOfType<Skybound.CameraSystem.CameraController>();
            if (cam != null)
            {
                cam.SetLevelBounds(_cameraBounds);
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(0.2f, 0.8f, 1f, 0.4f);
            Gizmos.DrawWireCube(_cameraBounds.center, _cameraBounds.size);
        }
#endif
    }
}
