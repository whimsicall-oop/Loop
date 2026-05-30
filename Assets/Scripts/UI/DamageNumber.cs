using UnityEngine;
using UnityEngine.UI;

namespace Skybound.UI
{
    /// <summary>
    /// Floating combat damage number. Pooled and reused; rises, drifts, fades, and scales
    /// with a pop. Crits render larger in the crit colour. Uses unscaled-aware timing so the
    /// pop still reads during hit-stop. World position is converted to the overlay canvas.
    /// </summary>
    [RequireComponent(typeof(CanvasGroup))]
    public class DamageNumber : MonoBehaviour
    {
        [SerializeField] private Text _label;
        [SerializeField] private float _lifetime = 0.8f;
        [SerializeField] private float _riseSpeed = 60f;
        [SerializeField] private Vector2 _drift = new Vector2(20f, 0f);
        [SerializeField] private Color _normalColor = Color.white;
        [SerializeField] private Color _critColor = new Color(1f, 0.8f, 0.2f);
        [SerializeField] private AnimationCurve _scalePop = AnimationCurve.EaseInOut(0, 0.6f, 0.2f, 1.2f);

        private CanvasGroup _group;
        private float _age;
        private float _driftX;
        private System.Action<DamageNumber> _onDone;

        private void Awake() => _group = GetComponent<CanvasGroup>();

        public void Show(float amount, bool crit, System.Action<DamageNumber> onDone)
        {
            _onDone = onDone;
            _age = 0f;
            _driftX = Random.Range(-_drift.x, _drift.x);

            _label.text = Mathf.RoundToInt(amount).ToString();
            _label.color = crit ? _critColor : _normalColor;
            _label.fontSize = crit ? 42 : 30;
            _group.alpha = 1f;
        }

        private void Update()
        {
            _age += Time.unscaledDeltaTime;
            float k = _age / _lifetime;

            transform.localPosition += new Vector3(_driftX, _riseSpeed, 0f) * Time.unscaledDeltaTime;
            float scale = _scalePop.Evaluate(Mathf.Min(k, _scalePop.keys[_scalePop.length - 1].time));
            transform.localScale = Vector3.one * scale;
            _group.alpha = 1f - Mathf.SmoothStep(0f, 1f, Mathf.InverseLerp(0.5f, 1f, k));

            if (k >= 1f)
            {
                _onDone?.Invoke(this);
            }
        }
    }
}
