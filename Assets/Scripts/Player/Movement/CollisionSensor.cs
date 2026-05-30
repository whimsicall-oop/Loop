using UnityEngine;

namespace Skybound.Player.Movement
{
    /// <summary>
    /// Box-cast based environment probing for the player. Kept separate from the motor
    /// (single responsibility) so it can be unit-reasoned and reused by enemies. Uses
    /// short casts off the collider bounds rather than trigger callbacks, which gives
    /// deterministic, same-frame results and avoids tunnelling at speed.
    /// </summary>
    [RequireComponent(typeof(Collider2D))]
    public class CollisionSensor : MonoBehaviour
    {
        [SerializeField] private LayerMask _groundMask;
        [SerializeField] private LayerMask _wallMask = ~0;
        [SerializeField, Min(0.01f)] private float _skin = 0.06f;
        [SerializeField, Range(0f, 1f)] private float _maxGroundSlope = 0.65f;

        private Collider2D _collider;

        public bool Grounded { get; private set; }
        public bool OnWall { get; private set; }
        public bool CeilingHit { get; private set; }

        /// <summary>-1 wall on left, +1 wall on right, 0 none.</summary>
        public int WallDirection { get; private set; }

        /// <summary>Surface normal of the ground under the player (up if airborne).</summary>
        public Vector2 GroundNormal { get; private set; } = Vector2.up;

        private void Awake() => _collider = GetComponent<Collider2D>();

        /// <summary>Run once per FixedUpdate before the motor integrates velocity.</summary>
        public void Probe()
        {
            Bounds b = _collider.bounds;

            Grounded = ProbeVertical(b, Vector2.down, out Vector2 normal);
            GroundNormal = Grounded ? normal : Vector2.up;
            CeilingHit = ProbeVertical(b, Vector2.up, out _);

            bool wallRight = ProbeHorizontal(b, Vector2.right);
            bool wallLeft = ProbeHorizontal(b, Vector2.left);
            OnWall = wallRight || wallLeft;
            WallDirection = wallRight ? 1 : wallLeft ? -1 : 0;
        }

        private bool ProbeVertical(Bounds b, Vector2 dir, out Vector2 normal)
        {
            var size = new Vector2(b.size.x * 0.95f, _skin);
            RaycastHit2D hit = Physics2D.BoxCast(b.center, size, 0f, dir, b.extents.y, _groundMask);
            normal = hit.normal;
            // Reject steep walls when probing for ground.
            return hit.collider != null && (dir != Vector2.down || hit.normal.y >= _maxGroundSlope);
        }

        private bool ProbeHorizontal(Bounds b, Vector2 dir)
        {
            var size = new Vector2(_skin, b.size.y * 0.8f);
            RaycastHit2D hit = Physics2D.BoxCast(b.center, size, 0f, dir, b.extents.x, _wallMask);
            return hit.collider != null;
        }
    }
}
