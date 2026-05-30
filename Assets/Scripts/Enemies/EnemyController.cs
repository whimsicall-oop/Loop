using Skybound.Combat;
using Skybound.Core;
using Skybound.Enemies.AI;
using UnityEngine;

namespace Skybound.Enemies
{
    /// <summary>
    /// Base controller wiring an <see cref="EnemyConfig"/> to a concrete <see cref="StateMachine"/>.
    /// Acts as the AI blackboard: caches perception results and exposes movement/attack
    /// primitives the state classes call. Hurt and Death are global transitions so any state
    /// is interruptible. Subclass to specialise attacks (melee golem vs. ranged archer).
    /// </summary>
    [RequireComponent(typeof(Rigidbody2D))]
    [RequireComponent(typeof(Health))]
    public class EnemyController : MonoBehaviour
    {
        [SerializeField] protected EnemyConfig Config;
        [SerializeField] protected Transform[] PatrolPoints;
        [SerializeField] protected LayerMask GroundMask;

        protected Rigidbody2D Body;
        protected Health Health;
        protected Transform Player;
        protected readonly StateMachine Machine = new StateMachine();

        // Blackboard ------------------------------------------------------------
        public EnemyConfig Data => Config;
        public bool CanSeePlayer { get; private set; }
        public float DistanceToPlayer { get; private set; } = Mathf.Infinity;
        public bool RecentlyHurt { get; private set; }
        public bool IsDead => !Health.IsAlive;
        public int Facing { get; protected set; } = 1;
        public Transform[] Patrol => PatrolPoints;

        // States (constructed once, reused) -------------------------------------
        protected IdleState Idle;
        protected PatrolState PatrolBehaviour;
        protected ChaseState Chase;
        protected AttackState Attack;
        protected RetreatState Retreat;
        protected HurtState Hurt;
        protected DeathState Death;

        private GameTimer _hurtFlag;

        protected virtual void Awake()
        {
            Body = GetComponent<Rigidbody2D>();
            Health = GetComponent<Health>();
            Health.SetMaxHearts(Mathf.CeilToInt(Config.MaxHealth / 2f), refill: true);

            Health.Damaged += OnDamaged;
            Health.Died += OnDied;

            var playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null)
            {
                Player = playerObj.transform;
            }

            BuildStateMachine();
        }

        protected virtual void BuildStateMachine()
        {
            Idle = new IdleState(this);
            PatrolBehaviour = new PatrolState(this);
            Chase = new ChaseState(this);
            Attack = new AttackState(this);
            Retreat = new RetreatState(this);
            Hurt = new HurtState(this);
            Death = new DeathState(this);

            Machine.AddTransition(Idle, PatrolBehaviour, () => PatrolPoints != null && PatrolPoints.Length > 0);
            Machine.AddTransition(PatrolBehaviour, Chase, () => CanSeePlayer);
            Machine.AddTransition(Idle, Chase, () => CanSeePlayer);
            Machine.AddTransition(Chase, Attack, () => DistanceToPlayer <= Config.AttackRange);
            Machine.AddTransition(Attack, Chase, () => DistanceToPlayer > Config.AttackRange && !Attack.OnCooldown);
            Machine.AddTransition(Chase, PatrolBehaviour, () => !CanSeePlayer && DistanceToPlayer > Config.SightRange * 1.5f);

            if (Config.CanRetreat)
            {
                Machine.AddAnyTransition(Retreat, () =>
                    !IsDead && Health.Normalized <= Config.RetreatHealthThreshold && CanSeePlayer);
                Machine.AddTransition(Retreat, Chase, () => DistanceToPlayer > Config.RetreatRange * 1.5f);
            }

            Machine.AddAnyTransition(Hurt, () => RecentlyHurt && !IsDead);
            Machine.AddAnyTransition(Death, () => IsDead);

            Machine.SetInitial(Idle);
        }

        protected virtual void Update()
        {
            if (!GameStateMachine.Instance.IsPlayable)
            {
                return;
            }

            UpdatePerception();
            if (_hurtFlag.Tick(Time.deltaTime))
            {
                RecentlyHurt = false;
            }

            Machine.Tick(Time.deltaTime);
        }

        private void UpdatePerception()
        {
            if (Player == null)
            {
                CanSeePlayer = false;
                DistanceToPlayer = Mathf.Infinity;
                return;
            }

            Vector2 toPlayer = Player.position - transform.position;
            DistanceToPlayer = toPlayer.magnitude;

            if (DistanceToPlayer > Config.SightRange)
            {
                CanSeePlayer = false;
                return;
            }

            float angle = Vector2.Angle(new Vector2(Facing, 0f), toPlayer);
            bool inCone = angle <= Config.SightAngle * 0.5f;
            bool lineOfSight = !Physics2D.Raycast(transform.position, toPlayer.normalized,
                DistanceToPlayer, Config.SightObstacles);

            CanSeePlayer = inCone && lineOfSight;
        }

        // --- Movement primitives used by states --------------------------------
        public void MoveHorizontal(float speed)
        {
            Body.velocity = new Vector2(speed * Facing, Body.velocity.y);
        }

        public void StopHorizontal()
        {
            Body.velocity = new Vector2(0f, Body.velocity.y);
        }

        public void FaceTowards(Vector3 worldPos)
        {
            Facing = worldPos.x >= transform.position.x ? 1 : -1;
            ApplyFacingVisual();
        }

        public void FlipFacing()
        {
            Facing = -Facing;
            ApplyFacingVisual();
        }

        protected virtual void ApplyFacingVisual()
        {
            Vector3 s = transform.localScale;
            s.x = Mathf.Abs(s.x) * Facing;
            transform.localScale = s;
        }

        /// <summary>True if a patrol step would walk off a ledge or into a wall.</summary>
        public bool BlockedAhead()
        {
            if (!Config.EdgeAware || Config.Flying)
            {
                return false;
            }

            Vector2 origin = transform.position;
            Vector2 ahead = origin + new Vector2(Facing * 0.6f, 0f);
            bool wall = Physics2D.Raycast(origin, new Vector2(Facing, 0f), 0.6f, GroundMask);
            bool ledge = !Physics2D.Raycast(ahead, Vector2.down, 1.2f, GroundMask);
            return wall || ledge;
        }

        /// <summary>Overridden by subclasses for melee swings or ranged shots.</summary>
        public virtual void PerformAttack()
        {
            if (Player == null)
            {
                return;
            }

            var dmg = Player.GetComponentInParent<IDamageable>();
            if (dmg != null && DistanceToPlayer <= Config.AttackRange)
            {
                Vector2 dir = (Player.position - transform.position).normalized;
                dmg.TakeDamage(new DamageInfo(Config.AttackDamage, DamageType.Physical,
                    transform.position, dir, 6f, false, gameObject));
            }
        }

        private void OnDamaged(DamageInfo info)
        {
            RecentlyHurt = true;
            _hurtFlag.Start(Config.HurtDuration);
            // Knockback away from the hit.
            Body.velocity = info.KnockbackDir * info.KnockbackForce;
        }

        private void OnDied()
        {
            Machine.ForceState(Death);
        }

        protected virtual void OnDestroy()
        {
            if (Health != null)
            {
                Health.Damaged -= OnDamaged;
                Health.Died -= OnDied;
            }
        }
    }
}
