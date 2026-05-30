using Skybound.Core;
using UnityEngine;

namespace Skybound.Enemies.AI
{
    /// <summary>
    /// Concrete behaviour states shared by the standard enemy roster. Each holds a back-
    /// reference to its <see cref="EnemyController"/> (the blackboard) and manipulates it
    /// through the controller's movement/attack primitives — states never touch physics
    /// directly, which keeps behaviour portable across flying and grounded archetypes.
    /// </summary>
    public abstract class EnemyStateBase : IState
    {
        protected readonly EnemyController E;
        protected EnemyStateBase(EnemyController e) => E = e;
        public virtual void Enter() { }
        public virtual void Tick(float dt) { }
        public virtual void Exit() { }
    }

    public sealed class IdleState : EnemyStateBase
    {
        private GameTimer _linger;
        public IdleState(EnemyController e) : base(e) { }
        public override void Enter() { E.StopHorizontal(); _linger.Start(1.0f); }
        public override void Tick(float dt) { _linger.Tick(dt); }
    }

    public sealed class PatrolState : EnemyStateBase
    {
        private int _target;
        public PatrolState(EnemyController e) : base(e) { }

        public override void Enter()
        {
            if (E.Patrol != null && E.Patrol.Length > 0)
            {
                E.FaceTowards(E.Patrol[_target].position);
            }
        }

        public override void Tick(float dt)
        {
            if (E.Patrol == null || E.Patrol.Length == 0)
            {
                // Fallback: ping-pong patrol turning at edges/walls.
                if (E.BlockedAhead())
                {
                    E.FlipFacing();
                }
                E.MoveHorizontal(E.Data.PatrolSpeed);
                return;
            }

            Transform point = E.Patrol[_target];
            E.FaceTowards(point.position);
            E.MoveHorizontal(E.Data.PatrolSpeed);

            if (Mathf.Abs(point.position.x - E.transform.position.x) < 0.2f)
            {
                _target = (_target + 1) % E.Patrol.Length;
            }
        }
    }

    public sealed class ChaseState : EnemyStateBase
    {
        public ChaseState(EnemyController e) : base(e) { }
        public override void Tick(float dt)
        {
            // Alert beat is folded into chase: face, then commit.
            Transform p = GameObject.FindGameObjectWithTag("Player")?.transform;
            if (p != null)
            {
                E.FaceTowards(p.position);
            }

            if (E.BlockedAhead())
            {
                E.StopHorizontal();
            }
            else
            {
                E.MoveHorizontal(E.Data.ChaseSpeed);
            }
        }
    }

    public sealed class AttackState : EnemyStateBase
    {
        private GameTimer _windup;
        private GameTimer _cooldown;
        private bool _swung;
        public AttackState(EnemyController e) : base(e) { }

        public bool OnCooldown => _cooldown.IsRunning;

        public override void Enter()
        {
            E.StopHorizontal();
            _windup.Start(E.Data.AttackWindup);
            _swung = false;
        }

        public override void Tick(float dt)
        {
            _cooldown.Tick(dt);
            if (!_swung && _windup.Tick(dt))
            {
                E.PerformAttack();
                _swung = true;
                _cooldown.Start(E.Data.AttackCooldown);
            }
        }
    }

    public sealed class RetreatState : EnemyStateBase
    {
        public RetreatState(EnemyController e) : base(e) { }
        public override void Tick(float dt)
        {
            Transform p = GameObject.FindGameObjectWithTag("Player")?.transform;
            if (p != null)
            {
                // Face the player but walk the opposite way.
                E.FaceTowards(p.position);
                Vector2 v = E.transform.position - p.position;
                int away = v.x >= 0f ? 1 : -1;
                E.MoveHorizontal(E.Data.ChaseSpeed * 0.8f * away * E.Facing);
            }
        }
    }

    public sealed class HurtState : EnemyStateBase
    {
        private GameTimer _t;
        public HurtState(EnemyController e) : base(e) { }
        public override void Enter() { _t.Start(E.Data.HurtDuration); }
        public override void Tick(float dt) { _t.Tick(dt); }
    }

    public sealed class DeathState : EnemyStateBase
    {
        private bool _done;
        public DeathState(EnemyController e) : base(e) { }

        public override void Enter()
        {
            E.StopHorizontal();
            // Reward + despawn is brokered through the controller so loot/XP stay in one place.
            EnemyDeathBroker.Report(E);
            Object.Destroy(E.gameObject, 1.2f); // let death animation play
            _done = true;
        }

        public override void Tick(float dt) { }
    }
}
