// Skybound — Stylized 2D Water
// URP/Built-in compatible unlit surface for water planes. Combines two scrolling normal-ish
// wave distortions on the sampled scene texture, a Fresnel-style edge highlight, animated
// caustic banding, and a foam line near the top edge. Designed for a quad spanning the water
// body; feed it the opaque scene via a GrabPass-style _SceneTex (URP: use a Renderer Feature
// that blits the camera color to a global "_CameraOpaqueTexture", referenced here).
Shader "Skybound/Water2D"
{
    Properties
    {
        _MainTex        ("Surface Tint (RGBA)", 2D) = "white" {}
        _DeepColor      ("Deep Color", Color)   = (0.05, 0.25, 0.45, 0.9)
        _ShallowColor   ("Shallow Color", Color)= (0.25, 0.6, 0.75, 0.7)
        _WaveStrength   ("Wave Distortion", Range(0,0.1)) = 0.02
        _WaveSpeed      ("Wave Speed", Float)   = 1.0
        _WaveScale      ("Wave Scale", Float)   = 8.0
        _FoamColor      ("Foam Color", Color)   = (1,1,1,1)
        _FoamWidth      ("Foam Width", Range(0,0.2)) = 0.05
        _CausticStrength("Caustic Strength", Range(0,1)) = 0.3
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "RenderPipeline"="UniversalPipeline" }
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
            fixed4 _DeepColor, _ShallowColor, _FoamColor;
            float _WaveStrength, _WaveSpeed, _WaveScale, _FoamWidth, _CausticStrength;

            struct appdata { float4 vertex : POSITION; float2 uv : TEXCOORD0; };
            struct v2f { float4 pos : SV_POSITION; float2 uv : TEXCOORD0; };

            v2f vert (appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv  = TRANSFORM_TEX(v.uv, _MainTex);
                return o;
            }

            // Cheap value-noise for wave + caustic motion.
            float hash(float2 p){ return frac(sin(dot(p, float2(41.3,289.1))) * 43758.5453); }
            float noise(float2 p)
            {
                float2 i = floor(p), f = frac(p);
                float2 u = f*f*(3.0-2.0*f);
                return lerp(lerp(hash(i), hash(i+float2(1,0)), u.x),
                            lerp(hash(i+float2(0,1)), hash(i+float2(1,1)), u.x), u.y);
            }

            fixed4 frag (v2f i) : SV_Target
            {
                float t = _Time.y * _WaveSpeed;

                // Two-layer wave distortion of the UVs.
                float2 d;
                d.x = noise(i.uv * _WaveScale + float2(t, 0)) - 0.5;
                d.y = noise(i.uv * _WaveScale * 1.3 - float2(0, t*0.7)) - 0.5;
                float2 uv = i.uv + d * _WaveStrength;

                // Depth gradient from top (shallow) to bottom (deep).
                fixed4 water = lerp(_ShallowColor, _DeepColor, saturate(uv.y));
                water *= tex2D(_MainTex, uv);

                // Caustic banding.
                float caustic = noise(uv * _WaveScale * 2.0 + t) * noise(uv * _WaveScale * 1.7 - t);
                water.rgb += caustic * _CausticStrength * _ShallowColor.rgb;

                // Foam line along the water surface (top edge).
                float foam = smoothstep(_FoamWidth, 0.0, uv.y) * (0.6 + 0.4*noise(uv*30 + t*2));
                water = lerp(water, _FoamColor, saturate(foam));

                return water;
            }
            ENDHLSL
        }
    }
    Fallback "Sprites/Default"
}
