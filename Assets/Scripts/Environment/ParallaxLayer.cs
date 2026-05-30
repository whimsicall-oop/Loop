using UnityEngine;

namespace Skybound.Environment
{
    /// <summary>
    /// Per-layer parallax scroller. Attach one to each of the 8–12 background/midground/
    /// foreground layers; the <see cref="ParallaxFactor"/> (0 = infinitely far/static,
    /// 1 = locked to camera/foreground) produces depth. Optional infinite horizontal
    /// tiling repositions the layer as the camera moves so a single sprite covers any width.
    /// Driven in LateUpdate after the camera has settled to avoid one-frame jitter.
    /// </summary>
    [ExecuteAlways]
    public class ParallaxLayer : MonoBehaviour
    {
        [SerializeField] private Transform _camera;
        [Tooltip("0 = distant/slow, 1 = moves with camera. Negative for foreground push.")]
        [SerializeField] private Vector2 _parallaxFactor = new Vector2(0.5f, 0.2f);
        [SerializeField] private bool _infiniteHorizontal;
        [SerializeField] private float _tileWidth = 20f;
        [Tooltip("Subtle idle drift (clouds), units/sec.")]
        [SerializeField] private Vector2 _autoScroll = Vector2.zero;

        private Vector3 _lastCamPos;
        private Vector3 _startPos;

        private void OnEnable()
        {
            if (_camera == null && UnityEngine.Camera.main != null)
            {
                _camera = UnityEngine.Camera.main.transform;
            }

            _startPos = transform.position;
            if (_camera != null)
            {
                _lastCamPos = _camera.position;
            }
        }

        private void LateUpdate()
        {
            if (_camera == null)
            {
                return;
            }

            Vector3 camDelta = _camera.position - _lastCamPos;
            transform.position += new Vector3(camDelta.x * _parallaxFactor.x, camDelta.y * _parallaxFactor.y, 0f);
            transform.position += (Vector3)_autoScroll * Time.deltaTime;
            _lastCamPos = _camera.position;

            if (_infiniteHorizontal && _tileWidth > 0f)
            {
                float relative = _camera.position.x - transform.position.x;
                if (Mathf.Abs(relative) >= _tileWidth)
                {
                    transform.position += new Vector3(Mathf.Sign(relative) * _tileWidth, 0f, 0f);
                }
            }
        }
    }
}
