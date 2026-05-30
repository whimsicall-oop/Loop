// Skybound — Grass / Foliage Wind
// Vertex-displacement wind for grass, bushes and foliage sprites. Sways the top of the
// sprite (UV.y near 1) while pinning the base (UV.y near 0), using layered sine waves
// phase-offset by world position so a field of grass never moves in unison. Reacts to a
// global _WindForce the WeatherSystem can drive, plus localized gusts.
Shader "Skybound/GrassWind"
{
    Properties
    {
        _MainTex     ("Sprite", 2D) = "white" {}
        _Color       ("Tint", Color) = (1,1,1,1)
        _WindFreq    ("Wind Frequency", Float) = 2.0
        _WindAmp     ("Wind Amplitude", Range(0,0.5)) = 0.08
        _Stiffness   ("Base Stiffness", Range(0.5,4)) = 2.0
        [PerRendererData] _WindForce ("Wind Force", Float) = 1.0
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True" }
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex; float4 _MainTex_ST;
            fixed4 _Color;
            float _WindFreq, _WindAmp, _Stiffness, _WindForce;

            struct appdata { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct v2f { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };

            v2f vert (appdata v)
            {
                v2f o;
                // World position phase offset so neighbours desync.
                float3 wp = mul(unity_ObjectToWorld, v.vertex).xyz;
                float phase = wp.x * 0.6 + wp.y * 0.3;

                // Height weight: 0 at base, 1 at tip (raised by stiffness for a natural bend).
                float h = pow(saturate(v.uv.y), _Stiffness);

                float wave = sin(_Time.y * _WindFreq + phase)
                           + 0.5 * sin(_Time.y * _WindFreq * 2.3 + phase * 1.7);
                v.vertex.x += wave * _WindAmp * h * max(_WindForce, 0.2);

                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv  = TRANSFORM_TEX(v.uv, _MainTex);
                o.color = v.color * _Color;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                fixed4 c = tex2D(_MainTex, i.uv) * i.color;
                return c;
            }
            ENDHLSL
        }
    }
    Fallback "Sprites/Default"
}
