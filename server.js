const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 'public'ディレクトリを静的配信
app.use(express.static(path.join(__dirname, 'public')));

// ミドルウェア
app.use(bodyParser.json());
app.use(cors());

// MongoDB Atlas に接続
mongoose.connect(
  'mongodb+srv://reviewUser:herogloleacff@cluster0.owuahmc.mongodb.net/reviewsApp?retryWrites=true&w=majority&appName=Cluster0'
)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log(err));

// スキーマ定義
const reviewSchema = new mongoose.Schema({
  occ: String,
  belong: String,
  age: String,
  gender: String,
  reason: [String],
  organization: String,
  period: String,
  time: String,
  country: String,
  people: String,
  genderRatio: String,
  nationality: String,
  cost: String,
  reason2: String,
  ratings: {
    interactive_children: String,
    interactive_people: String,
    education_language: String,
    education_sports: String,
    education_music: String,
    welfare_medical: String,
    welfare_elderly: String,
    welfare_disabilities: String,
    environment_forest: String,
    environment_animal: String,
    environment_sea: String,
    environment_clean: String,
    environment_agricluture: String,
    poverty_food: String,
    culture_history: String,
    culture_experience: String,
    culture_event: String,
    culture_town: String,
    infra_reconstruction: String,
    infra_water: String,
    infra_electricity: String,
    infra_traffic: String,
    infra_construction: String,
    meal_local: String,
    meal_japanese: String,
    language_speak: String,
    language_guide: String,
    private: String,
    official: String,
    freedom: String,
    support: String,
  },
  stay: [String],
  appeal: String,
  improve: String,
  comment: String,
  recommendation: String,
  // ここに新しい項目を追加
  activity_details: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// GET 口コミ一覧
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving reviews', error: err.message });
  }
});

// GET すべての団体名を取得
app.get('/organizations', async (req, res) => {
  try {
    const organizations = await Review.distinct('organization');
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving organizations', error: err.message });
  }
});

// GET 団体名で検索
app.get('/search', async (req, res) => {
  const query = req.query.organization;
  if (!query) {
    return res.status(400).json({ message: 'Organization query is required' });
  }

  try {
    // 正規表現を使ってあいまい検索
    const reviews = await Review.find({ organization: { $regex: query, $options: 'i' } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error searching reviews', error: err.message });
  }
});

// POST 口コミ追加
app.post('/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json({ message: 'Review saved successfully' });
  } catch (err) {
    console.error('Validation Error:', err);
    res.status(400).json({ message: 'Invalid data submitted', error: err.message });
  }
});

// DELETE 口コミ削除
app.delete('/reviews/:id', async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
});

// robots.txt を返す
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    `User-agent: *
Allow: /
Sitemap: https://reviews-app-a56v.onrender.com/sitemap.xml`
  );
});

// sitemap.xml を返す
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://reviews-app-a56v.onrender.com/sample.html</loc>
    <lastmod>2025-08-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://reviews-app-a56v.onrender.com/write_review.html</loc>
    <lastmod>2025-08-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://reviews-app-a56v.onrender.com/list.html</loc>
    <lastmod>2025-08-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://reviews-app-a56v.onrender.com/matching.html</loc>
    <lastmod>2025-09-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
});

// サーバー起動
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));