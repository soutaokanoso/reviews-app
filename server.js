const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;



// ミドルウェア
app.use(bodyParser.json());
app.use(cors());

// robots.txtへのリクエストを明示的に処理する
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow:\nSitemap: https://reviews-app-a56v.onrender.com/sitemap.xml');
});

// 静的ファイルを配信する既存のミドルウェア
app.use(express.static(path.join(__dirname, 'public')));

// 'public'ディレクトリを静的配信
app.use(express.static(path.join(__dirname, 'public')));

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
  helpfulCount: { type: Number, default: 0 }, // 役立ったカウントのフィールドを追加
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

// POST 役立ったボタンのクリックを処理
app.post('/reviews/helpful/:id', async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true } // 更新後のドキュメントを返す
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Helpful count updated successfully', helpfulCount: updatedReview.helpfulCount });
  } catch (err) {
    res.status(500).json({ message: 'Error updating helpful count', error: err.message });
  }
});

// サーバー起動
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));