// 单景点 SEO 实体绑定配置（变量表在此集中管理，页面与 JSON-LD 共用）
export const attraction = {
  domain: 'mimosusogawa.com',
  siteUrl: 'https://mimosusogawa.com',
  fullName: 'みもすそ川公園',
  shortName: '御裳川公園',
  englishName: 'Mimosusogawa Park',
  city: '下関市',
  state: '山口県',
  country: '日本',
  countryEn: 'Japan',
  countryCode: 'JP',
  postalCode: '751-0813',
  streetAddress: 'みもすそ川町1-1',
  latitude: 33.9577,
  longitude: 130.967,
  mapsUrl: 'https://maps.app.goo.gl/8DpG1oUKvtUSqZBT6',
  mapsEmbedSrc:
    'https://maps.google.com/maps?q=%E3%81%BF%E3%82%82%E3%81%99%E3%81%9D%E5%B7%9D%E5%85%AC%E5%9C%92&output=embed',
  govTourismUrl: 'https://yamaguchi-tourism.jp/spot/detail_15266.html',
  phone: '+81-83-231-1933',
  rating: 4.1,
  reviewCount: 1611,
  reviewCountDisplay: '1,611',
  reviewSyncMonth: '2026 年 9 月',
  nearbyLandmarks: ['壇ノ浦古戦場跡', '関門橋']
} as const;

// 评价来源说明（页面展示用，不写入 JSON-LD）
export const reviewsSourceNote = `同步自 Google 地图用户评价，同步时间 ${attraction.reviewSyncMonth}；版权归原作者与 Google 地图所有`;
export const reviewsInlineNote = `评分与评价数同步自谷歌地图（Google Maps）用户评价 · ${attraction.reviewSyncMonth} · 点击查看谷歌地图全部评价`;

// FAQ の単一ソース（表示 DOM と JSON-LD で共有し、一致を保つ）
export const faqSections = [
  {
    heading: '公園について',
    items: [
      {
        question: '公園の入園料は必要ですか？',
        answer: '公園は無料で見学できます。園内の像、碑、長州砲、海峡沿いの景色を自由に楽しめます。'
      },
      {
        question: '見学時間はどれくらいですか？',
        answer: '公園だけなら30〜45分が目安です。説明を丁寧に読み、船や潮を眺めるなら1時間ほどあるとゆったりできます。'
      },
      {
        question: '公園で何を見るべきですか？',
        answer: '源義経・平知盛像、壇ノ浦古戦場碑、長州砲、関門橋が中心です。海沿いで潮流と船も眺めると、史跡と地形がつながります。'
      },
      {
        question: '紙芝居は毎日ありますか？',
        answer: '通常の実施時間が案内されていますが、休演日や天候による変更があります。山口県観光サイトの最新情報をご確認ください。'
      },
      {
        question: '長州砲はいつ鳴りますか？',
        answer: '中央の一門では通常、日中の毎正時に発射音と煙の演出があります。運営状況により変わることがあるため、現地案内を優先してください。'
      }
    ]
  },
  {
    heading: '行き方について',
    items: [
      {
        question: '下関駅からどう行きますか？',
        answer: '路線バスで「御裳川」バス停へ向かいます。所要は交通状況により約12〜15分が目安で、下車後は公園のすぐ近くです。'
      },
      {
        question: '唐戸市場から行けますか？',
        answer: '唐戸エリアの国道沿いから御裳川方面のバスを利用できます。唐戸市場、赤間神宮、公園を半日でつなぐルートがおすすめです。'
      },
      {
        question: '駐車場はありますか？',
        answer: '関門トンネル人道下関側入口に無料駐車場があります。一般車40台、大型バス1台を収容し、公園と人道の両方へ歩いて向かえます。'
      },
      {
        question: 'トイレやエレベーターはありますか？',
        answer: '関門トンネル人道下関側入口に多機能トイレとエレベーターがあります。'
      },
      {
        question: '門司側から公園へ行けますか？',
        answer: '和布刈側から関門トンネル人道を歩き、下関側へ上がると、公園はすぐ近くです。'
      }
    ]
  },
  {
    heading: '関門トンネル人道',
    items: [
      {
        question: '人道は有料ですか？',
        answer: '歩行者は無料です。自転車と原付は20円で、乗らずに押して通行します。'
      },
      {
        question: '人道は何時まで通れますか？',
        answer: '通常は6時から22時まで通行できます。設備点検などで変更される場合があるため、利用前に最新情報をご確認ください。'
      },
      {
        question: '門司まで歩くと何分かかりますか？',
        answer: '人道部分は片道約15分が目安です。公園から入口への移動、エレベーター、写真撮影、門司側の散策時間を別に見てください。'
      },
      {
        question: 'キャリーケースやベビーカーで通れますか？',
        answer: '入口にはエレベーターがあり、通行できます。ただし人道内は長いゆるやかな坂なので、荷物と体力に余裕を持ってください。'
      }
    ]
  },
  {
    heading: '天候・子ども・写真',
    items: [
      {
        question: '雨の日でも楽しめますか？',
        answer: '公園は屋外ですが、人道は雨を避けて歩けます。海沿いは風が強くなることがあるため、雨具があると安心です。'
      },
      {
        question: '子ども連れに向いていますか？',
        answer: '船、橋、海底県境など子どもにも分かりやすい見どころがあります。車道と海沿いでは手をつなぎ、海底県境まで往復する場合は休憩を含めて計画してください。'
      },
      {
        question: '夜でも写真を撮れますか？',
        answer: '橋の灯りや海峡の夜景を撮れますが、足元、車道、海沿いの風に注意してください。園内や施設の利用案内に従いましょう。'
      }
    ]
  }
];

// フラット化（JSON-LD 用）
export const faqItems = faqSections.flatMap((s) => s.items);
