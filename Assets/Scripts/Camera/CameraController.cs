using Skybound.Core;
using UnityEngine;

namespace Skybound.CameraSystem
{
    /// <summary>
    /// Production 2D follow camera. Implements the features that separate a polished
    /// platformer camera from a naive LookAt: a dead zone (no movement for small player
    /// motions), velocity-based look-ahead, soft damping (critically-damped SmoothDamp so
    /// there is never overshoot/jitter), dynamic zoom on speed, and a cinematic-focus mode
    /// for boss framing and reveals. Runs in LateUpdate after all movement has resolved.
    ///
    /// In a shipping project this typically wraps Cinemachine; this hand-rolled rig is
    /// dependency-free, deterministic, and documents the exact behaviour we want.
    /// </summary>
    [RequireComponent(typeof(UnityEngine.Camera))]
    public class CameraController : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform _target;
        [SerializeField] private Vector2 _offset = new Vector2(0f, 1f);

        [Header("Dead Zone (world units)")]
        [SerializeField] private Vector2 _deadZone = new Vector2(1.6f, 1.2f);

        [Header("Damping")]
        [SerializeField] private float _smoothTime = 0.18f;

        [Header("Look-Ahead")]
        [SerializeField] private float _lookAheadDistance = 2.5f;
        [SerializeField] private float _lookAheadSmoothing = 0.4f;

        [Header("Dynamic Zoom (orthographic size)")]
        [SerializeField] private float _baseSize = 6f;
        [SerializeField] private float _maxSize = 7.2f;
        [SerializeField] private float _speedForMaxZoom = 12f;
        [SerializeField] private float _zoomSmoothing = 0.5f;

        [Header("Bounds (optional confiner)")]
        [SerializeField] private bool _useBounds;
        [SerializeField] private Bounds _levelBounds;

        private UnityEngine.Camera _cam;
        private Rigidbody2D _targetBody;
        private Vector3 _velocityRef;
        private float _lookAheadX;
        private float _lookAheadVelRef;
        private float _sizeVelRef;

        // Cinematic override (boss intros, reveals).
        private Transform _focusOverride;
        private float _focusBlend;

        private void Awake()
        {
            _cam = GetComponent<UnityEngine.Camera>();
            if (_target != null)
            {
                _targetBody = _target.GetComponentInParent<Rigidbody2D>();
            }
        }

        public void SetTarget(Transform target)
        {
            _target = target;
            _targetBody = target != null ? target.GetComponentInParent<Rigidbody2D>() : null;
        }

        /// <summary>Smoothly frame a cinematic point (boss, reveal). Pass null to release.</summary>
        public void SetCinematicFocus(Transform focus) => _focusOverride = focus;

        private void LateUpdate()
        {
            if (_target == null)
            {
                return;
            }

            _focusBlend = Mathf.MoveTowards(_focusBlend, _focusOverride != null ? 1f : 0f, Time.deltaTime / 0.6f);

            Vector3 desired = ComputeDesiredPosition();
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref _velocityRef, _smoothTime);

            UpdateZoom();
        }

        private Vector3 ComputeDesiredPosition()
        {
            Vector3 followPoint = _target.position + (Vector3)_offset;

            // Look-ahead biases the camera toward travel direction.
            float vx = _targetBody != null ? _targetBody.velocity.x : 0f;
            float targetLook = Mathf.Clamp(vx / 8f, -1f, 1f) * _lookAheadDistance;
            _lookAheadX = Mathf.SmoothDamp(_lookAheadX, targetLook, ref _lookAheadVelRef, _lookAheadSmoothing);
            followPoint.x += _lookAheadX;

            // Dead zone: hold the camera still on an axis until the target leaves the box,
            // then pull only by the overflow so re-entry is smooth (no snap).
            Vector3 cam = transform.position;
            float dx = followPoint.x - cam.x;
            float dy = followPoint.y - cam.y;

            float resolvedX = cam.x;
            if (Mathf.Abs(dx) > _deadZone.x)
            {
                resolvedX = followPoint.x - Mathf.Sign(dx) * _deadZone.x;
            }

            float resolvedY = cam.y;
            if (Mathf.Abs(dy) > _deadZone.y)
            {
                resolvedY = followPoint.y - Mathf.Sign(dy) * _deadZone.y;
            }

            Vector3 result = new Vector3(resolvedX, resolvedY, cam.z);

            // Cinematic blend.
            if (_focusOverride != null || _focusBlend > 0f)
            {
                Vector3 focusPos = _focusOverride != null
                    ? new Vector3(_focusOverride.position.x, _focusOverride.position.y, cam.z)
                    : result;
                result = Vector3.Lerp(result, focusPos, _focusBlend);
            }

            if (_useBounds)
            {
                result = ClampToBounds(result);
            }

            return result;
        }

        private void UpdateZoom()
        {
            float speed = _targetBody != null ? Mathf.Abs(_targetBody.velocity.x) : 0f;
            float t = Mathf.Clamp01(speed / _speedForMaxZoom);
            float targetSize = Mathf.Lerp(_baseSize, _maxSize, t);
            _cam.orthographicSize = Mathf.SmoothDamp(_cam.orthographicSize, targetSize, ref _sizeVelRef, _zoomSmoothing);
        }

        private Vector3 ClampToBounds(Vector3 pos)
        {
            float vExtent = _cam.orthographicSize;
            float hExtent = vExtent * _cam.aspect;
            pos.x = Mathf.Clamp(pos.x, _levelBounds.min.x + hExtent, _levelBounds.max.x - hExtent);
            pos.y = Mathf.Clamp(pos.y, _levelBounds.min.y + vExtent, _levelBounds.max.y - vExtent);
            return pos;
        }

        public void SetLevelBounds(Bounds bounds)
        {
            _levelBounds = bounds;
            _useBounds = true;
        }
    }
}
