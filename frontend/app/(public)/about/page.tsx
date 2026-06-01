"use client";

import React from 'react';
import { useAppLanguage } from '@/config/i18n';

const copy = {
  vi: {
    title: "Về Chúng Tôi",
    subtitle: "MESHIMAP — Cầu nối ẩm thực và văn hóa Việt Nam - Nhật Bản",
    storyTitle: "Câu chuyện của Meshimap",
    storyText: "MESHIMAP ra đời từ tình yêu sâu sắc dành cho văn hóa ẩm thực Nhật Bản và mong muốn mang đến một nền tảng khám phá và đặt chỗ nhà hàng chuyên nghiệp nhất tại Việt Nam. Chúng tôi tin rằng, ẩm thực không chỉ là món ăn, mà còn là văn hóa, câu chuyện và sự kết nối giữa những con người.",
    missionTitle: "Sứ mệnh của chúng tôi",
    missionText: "Giúp thực khách dễ dàng tìm kiếm, đánh giá và đặt bàn tại các nhà hàng Nhật Bản chất lượng nhất. Đồng thời, hỗ trợ các chủ nhà hàng tối ưu hóa quy trình vận hành và tiếp cận hàng ngàn khách hàng tiềm năng một cách chuyên nghiệp nhất.",
    valuesTitle: "Giá trị cốt lõi",
    values: [
      {
        title: "Chất lượng hàng đầu",
        desc: "Mọi nhà hàng trên hệ thống đều được kiểm duyệt kỹ lưỡng về chất lượng dịch vụ và uy tín pháp lý."
      },
      {
        title: "Trải nghiệm mượt mà",
        desc: "Hệ thống đặt bàn thời gian thực và thông báo tức thì đem lại trải nghiệm hoàn hảo cho cả khách hàng và chủ quán."
      },
      {
        title: "Gắn kết văn hóa",
        desc: "Chúng tôi tự hào là cầu nối đưa tinh hoa ẩm thực xứ sở Mặt trời mọc đến gần hơn với người dân Việt Nam."
      }
    ],
    featuresTitle: "Tính năng nổi bật",
    features: [
      { icon: "📅", title: "Đặt bàn nhanh chóng", desc: "Giữ chỗ chỉ với vài thao tác và nhận phản hồi phê duyệt tức thì." },
      { icon: "🔍", title: "Tìm kiếm thông minh", desc: "Lọc theo loại hình ẩm thực, khu vực và đánh giá của cộng đồng." },
      { icon: "💬", title: "Phản hồi chân thực", desc: "Đánh giá và đóng góp ý kiến trực tiếp giúp nâng cao chất lượng dịch vụ." }
    ],
    teamTitle: "Đội ngũ phát triển",
    teamSubtitle: "Chúng tôi là những nhà phát triển trẻ tuổi đam mê công nghệ và ẩm thực, nỗ lực hết mình vì trải nghiệm tốt nhất của bạn."
  },
  ja: {
    title: "会社概要",
    subtitle: "MESHIMAP — ベトナムと日本の食文化をつなぐ架け橋",
    storyTitle: "Meshimapのストーリー",
    storyText: "MESHIMAPは、日本の豊かな食文化への深い愛と、ベトナムで最もプロフェッショナルなレストラン発見・予約プラットフォームを提供したいという願いから誕生しました。私たちは、料理は単なる食べ物ではなく、文化であり、物語であり、人々のつながりであると信じています。",
    missionTitle: "私たちの使命",
    missionText: "美食家が最高の日本食レストランを簡単に検索、評価、予約できるようにすること。同時に、レストランオーナーが運営を最適化し、プロフェッショナルな方法で何千人もの潜在顧客にアプローチできるよう支援すること。",
    valuesTitle: "コアバリュー",
    values: [
      {
        title: "最高品質",
        desc: "システム上のすべてのレストランは、サービスの質と法的資格について厳格に審査されています。"
      },
      {
        title: "シームレスな体験",
        desc: "リアルタイムの予約システムと即時通知により、顧客とオーナー双方に完璧な体験を提供します。"
      },
      {
        title: "文化の絆",
        desc: "日出ずる国の食の本質をベトナムの人々により身近に届ける架け架け橋となることを誇りに思っています。"
      }
    ],
    featuresTitle: "主な機能",
    features: [
      { icon: "📅", title: "スピーディーな予約", desc: "数ステップで席を確保し、即時に承認通知を受け取ることができます。" },
      { icon: "🔍", title: "スマート検索", desc: "料理ジャンル、エリア、コミュニティの評価で絞り込み検索が可能です。" },
      { icon: "💬", title: "リアルなフィードバック", desc: "直接評価やフィードバックを送ることで、サービスの向上を後越しします。" }
    ],
    teamTitle: "開発チーム",
    teamSubtitle: "私たちはテクノロジーと食文化を愛する若き開発者チームであり、皆様の体験向上のために全力を尽くしています。"
  }
};

export default function AboutPage() {
  const { language } = useAppLanguage();
  const t = copy[language];

  return (
    <main style={{ minHeight: '80vh', background: 'var(--clr-cream)', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--clr-dark) 0%, var(--clr-deeper) 100%)',
        color: 'var(--clr-white)',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-20%',
          width: '60%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(253, 138, 62, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            fontFamily: 'var(--font-brand-google)',
            color: 'var(--clr-primary)',
            marginBottom: '16px',
            lineHeight: 1.2
          }}>
            {t.title}
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--clr-light)',
            fontWeight: 500,
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.5
          }}>
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Story & Mission */}
      <section style={{ maxWidth: '1000px', margin: '60px auto 0', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'start'
        }} className="about-story-grid">
          <div style={{
            background: 'var(--clr-white)',
            border: '1px solid var(--clr-border)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--clr-dark)',
              marginBottom: '16px',
              fontFamily: 'var(--font-brand-google)'
            }}>
              {t.storyTitle}
            </h2>
            <p style={{
              fontSize: '14.5px',
              color: 'var(--clr-medium)',
              lineHeight: 1.8
            }}>
              {t.storyText}
            </p>
          </div>

          <div style={{
            background: 'var(--clr-white)',
            border: '1px solid var(--clr-border)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'var(--clr-dark)',
              marginBottom: '16px',
              fontFamily: 'var(--font-brand-google)'
            }}>
              {t.missionTitle}
            </h2>
            <p style={{
              fontSize: '14.5px',
              color: 'var(--clr-medium)',
              lineHeight: 1.8
            }}>
              {t.missionText}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ maxWidth: '1000px', margin: '80px auto 0', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--clr-dark)',
          textAlign: 'center',
          marginBottom: '40px',
          fontFamily: 'var(--font-brand-google)'
        }}>
          {t.valuesTitle}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {t.values.map((val, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(to bottom, var(--clr-white) 0%, var(--clr-cream) 100%)',
              border: '1px solid var(--clr-border)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(253, 138, 62, 0.1)',
                color: 'var(--clr-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                margin: '0 auto 16px'
              }}>
                {idx + 1}
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--clr-dark)',
                marginBottom: '12px'
              }}>
                {val.title}
              </h3>
              <p style={{
                fontSize: '13.5px',
                color: 'var(--clr-medium)',
                lineHeight: 1.6
              }}>
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section style={{ maxWidth: '1000px', margin: '80px auto 0', padding: '0 24px' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--clr-dark)',
          textAlign: 'center',
          marginBottom: '40px',
          fontFamily: 'var(--font-brand-google)'
        }}>
          {t.featuresTitle}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {t.features.map((feat, idx) => (
            <div key={idx} style={{
              background: 'var(--clr-white)',
              border: '1px solid var(--clr-border)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'start',
              boxShadow: 'var(--shadow-card)'
            }}>
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{feat.icon}</span>
              <div>
                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--clr-dark)',
                  marginBottom: '8px'
                }}>
                  {feat.title}
                </h3>
                <p style={{
                  fontSize: '13.5px',
                  color: 'var(--clr-medium)',
                  lineHeight: 1.6
                }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: '800px', margin: '80px auto 0', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--clr-dark)',
          marginBottom: '16px',
          fontFamily: 'var(--font-brand-google)'
        }}>
          {t.teamTitle}
        </h2>
        <p style={{
          fontSize: '14.5px',
          color: 'var(--clr-muted)',
          maxWidth: '550px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          {t.teamSubtitle}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-dark) 100%)',
              color: 'var(--clr-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 16px',
              boxShadow: '0 4px 10px rgba(108, 47, 0, 0.15)'
            }}>
              🎓
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--clr-dark)' }}>JPS Team</h3>
            <p style={{ fontSize: '12px', color: 'var(--clr-muted)', marginTop: '4px' }}>Software Engineers</p>
          </div>
        </div>
      </section>
      
      {/* Responsive layout CSS embedded */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .about-story-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </main>
  );
}
