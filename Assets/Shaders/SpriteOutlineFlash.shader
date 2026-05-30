// Skybound — Sprite Outline + Hit Flash
// Multi-purpose sprite material used by the player, enemies and pickups. Adds a crisp,
// adjustable outline by sampling neighbouring alpha (so it works on any sprite without an
// authored outline), plus a white "hit flash" lerp driven per-renderer for damage feedback,
// and a rim/glow tint for power-up auras. One shader covers character outlines + i-frame
// flashing + collectible shimmer, reducing material count for batching.
Shader "Skybound/SpriteOutlineFlash"
{
    Properties
    {
        [PerRendererData] _MainTex ("Sprite Texture", 2D) = "white" {}
        _Color        ("Tint", Color) = (1,1,1,1)
        _OutlineColor ("Outline Color", Color) = (1, 0.95, 0.6, 1)
        _OutlineWidth ("Outline Width (texels)", Range(0,6)) = 1.5
        [PerRendererData] _FlashColor ("Flash Color", Color) = (1,1,1,1)
        [PerRendererData] _FlashAmount("Flash Amount", Range(0,1)) = 0
        _Glow         ("Glow Intensity", Range(0,3)) = 0
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "PreviewType"="Plane" "CanUseSpriteAtlas"="True" }
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex; float4 _MainTex_TexelSize;
            fixed4 _Color, _OutlineColor, _FlashColor;
            float _OutlineWidth, _FlashAmount, _Glow;

            struct appdata { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct v2f { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };

            v2f vert (appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.color = v.color * _Color;
                return o;
            }

            // Max alpha of the 4 cardinal neighbours — detects sprite silhouette edges.
            float neighbourAlpha(float2 uv, float2 texel)
            {
                float a = 0;
                a = max(a, tex2D(_MainTex, uv + float2( texel.x, 0)).a);
                a = max(a, tex2D(_MainTex, uv + float2(-texel.x, 0)).a);
                a = max(a, tex2D(_MainTex, uv + float2(0,  texel.y)).a);
                a = max(a, tex2D(_MainTex, uv + float2(0, -texel.y)).a);
                return a;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                fixed4 c = tex2D(_MainTex, i.uv) * i.color;
                float2 texel = _MainTex_TexelSize.xy * _OutlineWidth;

                // Where the sprite is transparent but a neighbour is opaque → outline.
                float edge = (1.0 - c.a) * step(0.01, neighbourAlpha(i.uv, texel));
                fixed4 outline = _OutlineColor;
                outline.a *= edge;

                fixed4 outCol = lerp(c, outline, edge);

                // Hit flash: push toward flash colour.
                outCol.rgb = lerp(outCol.rgb, _FlashColor.rgb, _FlashAmount);

                // Additive glow for power auras / collectible shimmer.
                outCol.rgb += outCol.rgb * _Glow;

                return outCol;
            }
            ENDHLSL
        }
    }
    Fallback "Sprites/Default"
}
