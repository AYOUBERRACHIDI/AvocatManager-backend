
const mongoose = require('mongoose');
const Type = require('./models/Type'); // Adjust path to your Type model

const types = [
  { _id: "1", name: "القضاء المدني", mainType: null },
  { _id: "1.1", name: "قضايا مدنية عادية", mainType: "1" },
  { _id: "1.1.1", name: "قضايا التعويض عن الضرر", mainType: "1.1" },
  { _id: "1.1.2", name: "قضايا النزاعات حول العقود", mainType: "1.1" },
  { _id: "1.1.3", name: "قضايا الشفعة والرجوع في الهبة", mainType: "1.1" },
  { _id: "1.1.4", name: "قضايا المسؤولية المدنية", mainType: "1.1" },
  { _id: "1.2", name: "القضايا العقارية", mainType: "1" },
  { _id: "1.2.1", name: "قضايا التحفيظ العقاري", mainType: "1.2" },
  { _id: "1.2.2", name: "قضايا النزاعات حول الملكية العقارية", mainType: "1.2" },
  { _id: "1.2.3", name: "قضايا القسمة", mainType: "1.2" },
  { _id: "1.2.4", name: "قضايا نزع الملكية للمنفعة العامة", mainType: "1.2" },
  { _id: "1.3", name: "قضايا الأسرة", mainType: "1" },
  { _id: "1.3.1", name: "الزواج وتوثيقه", mainType: "1.3" },
  { _id: "1.3.2", name: "الطلاق والتطليق", mainType: "1.3" },
  { _id: "1.3.3", name: "النفقة والحضانة", mainType: "1.3" },
  { _id: "1.3.4", name: "ثبوت النسب", mainType: "1.3" },
  { _id: "1.3.5", name: "قضايا الإرث والوصايا", mainType: "1.3" },
  { _id: "2", name: "القضاء الجنائي", mainType: null },
  { _id: "2.1", name: "الجنح", mainType: "2" },
  { _id: "2.1.1", name: "جنح الاعتداءات الجسدية", mainType: "2.1" },
  { _id: "2.1.2", name: "جنح السرقة، النصب، خيانة الأمانة", mainType: "2.1" },
  { _id: "2.1.3", name: "مخالفات السير الخطيرة", mainType: "2.1" },
  { _id: "2.2", name: "الجنايات", mainType: "2" },
  { _id: "2.2.1", name: "جرائم القتل العمد أو الخطأ", mainType: "2.2" },
  { _id: "2.2.2", name: "جرائم الاغتصاب وهتك العرض", mainType: "2.2" },
  { _id: "2.2.3", name: "جرائم الاختلاس والرشوة وتبديد الأموال العامة", mainType: "2.2"},
  { _id: "2.2.4", name: "جرائم تكوين عصابات إجرامية", mainType: "2.2" },
  { _id: "2.3", name: "المخالفات", mainType: "2" },
  { _id: "2.3.1", name: "مخالفات المرور العادية", mainType: "2.3" },
  { _id: "2.3.2", name: "المخالفات البيئية والصحية", mainType: "2.3" },
  { _id: "3", name: "القضاء التجاري", mainType: null },
  { _id: "3.1", name: "قضايا نزاعات الشركات", mainType: "3" },
  { _id: "3.1.1", name: "تأسيس الشركات", mainType: "3.1" },
  { _id: "3.1.2", name: "تصفية الشركات أو حلها", mainType: "3.1" },
  { _id: "3.2", name: "قضايا العقود التجارية", mainType: "3" },
  { _id: "3.2.1", name: "نزاعات عقود البيع التجاري", mainType: "3.2" },
  { _id: "3.2.2", name: "نزاعات التوزيع والوكالة التجارية", mainType: "3.2" },
  { _id: "3.3", name: "الإفلاس والتسوية القضائية", mainType: "3" },
  { _id: "3.3.1", name: "قضايا التصفية القضائية للمقاولات", mainType: "3.3" },
  { _id: "3.3.2", name: "قضايا صعوبات المقاولة", mainType: "3.3" },
  { _id: "4", name: "القضاء الإداري", mainType: null },
  { _id: "4.1", name: "قضايا الطعون الإدارية", mainType: "4" },
  { _id: "4.1.1", name: "الطعن في قرارات الإدارة", mainType: "4.1" },
  { _id: "4.2", name: "قضايا المسؤولية الإدارية", mainType: "4" },
  { _id: "4.2.1", name: "دعاوى التعويض عن الضرر الناتج عن خطأ إداري", mainType: "4.2" },
  { _id: "4.3", name: "قضايا الصفقات العمومية", mainType: "4" },
  { _id: "4.3.1", name: "نزاعات حول تنفيذ أو فسخ عقود الصفقات العمومية", mainType: "4.3" },
  { _id: "5", name: "قضاء الأسرة", mainType: null },
  { _id: "5.1", name: "الزواج والتعدد", mainType: "5" },
  { _id: "5.2", name: "الطلاق والتطليق", mainType: "5" },
  { _id: "5.3", name: "النفقة", mainType: "5" },
  { _id: "5.4", name: "الحضانة", mainType: "5" },
  { _id: "5.5", name: "الكفالة", mainType: "5" },
  { _id: "5.6", name: "الإرث والوصايا", mainType: "5" },
  { _id: "6", name: "القضاء الاجتماعي", mainType: null },
  { _id: "6.1", name: "النزاعات الفردية للعمل", mainType: "6" },
  { _id: "6.1.1", name: "الطرد التعسفي", mainType: "6.1" },
  { _id: "6.1.2", name: "المطالبة بالتعويضات عن الفصل", mainType: "6.1" },
  { _id: "6.1.3", name: "نزاعات الأجور والعطل السنوية", mainType: "6.1" },
  { _id: "6.2", name: "النزاعات الجماعية للعمل", mainType: "6" },
  { _id: "6.2.1", name: "الإضرابات", mainType: "6.2" },
  { _id: "6.2.2", name: "التفاوض الجماعي", mainType: "6.2" },
  { _id: "6.2.3", name: "نزاعات الاتفاقيات الجماعية", mainType: "6.2" },
];

async function insertTypes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/your_database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const idMap = new Map(); // Maps placeholder _id (e.g., "1") to actual MongoDB _id

    for (const type of types) {
      let mainTypeId = null;
      if (type.mainType) {
        mainTypeId = idMap.get(type.mainType);
        if (!mainTypeId) {
          throw new Error(`Parent type ${type.mainType} not found for ${type.name}`);
        }
      }

      const newType = new Type({
        name: type.name,
        mainType: mainTypeId,
      });

      const savedType = await newType.save();
      idMap.set(type._id, savedType._id);
      console.log(`Inserted: ${type.name} with _id: ${savedType._id}`);
    }

    console.log('All types inserted successfully');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error inserting types:', error);
  }
}

insertTypes();