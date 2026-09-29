require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Student = require('./models/Student');
const Staff = require('./models/Staff');
const Subject = require('./models/Subject');
const VivaSchedule = require('./models/VivaSchedule');
const VivaResult = require('./models/VivaResult');
const MCQQuestion = require('./models/MCQQuestion');
const ChatLog = require('./models/ChatLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Subject.deleteMany({});
    await VivaSchedule.deleteMany({});
    await VivaResult.deleteMany({});
    await MCQQuestion.deleteMany({});
    await ChatLog.deleteMany({});

    console.log('Creating subjects...');
    const subjectsData = [
      {
        name: 'Advanced Java Programming',
        code: 'AJP',
        staffName: 'Srinivasan',
        labTopics: ['JDBC and Database Connectivity', 'Servlets and JSP', 'Hibernate Framework', 'Spring Framework Basics', 'Java Collections Framework', 'Multithreading in Java', 'Java GUI with Swing', 'Exception Handling in Java']
      },
      {
        name: 'Artificial Intelligence and Machine Learning',
        code: 'AIML',
        staffName: 'Revathi',
        labTopics: ['Linear Regression', 'Decision Trees', 'Neural Networks', 'K-Means Clustering', 'Support Vector Machines', 'Natural Language Processing', 'Deep Learning Basics', 'Reinforcement Learning']
      },
      {
        name: 'Sentiment Analysis',
        code: 'SA',
        staffName: 'Selvi',
        labTopics: ['Text Preprocessing', 'Bag of Words Model', 'TF-IDF Vectorization', 'VADER Sentiment Analysis', 'LSTM for Sentiment', 'BERT Fine-tuning', 'Twitter Sentiment Analysis', 'Product Review Analysis']
      },
      {
        name: 'Big Data Analytics Using R and Hadoop',
        code: 'BDA',
        staffName: 'Dhanalakshmi',
        labTopics: ['Hadoop HDFS Operations', 'MapReduce Programming', 'Hive Query Language', 'Pig Latin Scripts', 'R Data Visualization', 'Spark with R', 'Data Wrangling in R', 'Machine Learning with Spark MLlib']
      }
    ];

    const createdSubjects = await Subject.insertMany(subjectsData);

    console.log('Creating staff...');
    const staffPasswords = await bcrypt.hash('staff123', 10);
    
    const staffData = [
      { name: 'Srinivasan', staffId: 'STAFF001', username: 'srinivasan', password: staffPasswords, subjectId: createdSubjects[0]._id, subjectName: createdSubjects[0].name },
      { name: 'Revathi', staffId: 'STAFF002', username: 'revathi', password: staffPasswords, subjectId: createdSubjects[1]._id, subjectName: createdSubjects[1].name },
      { name: 'Selvi', staffId: 'STAFF003', username: 'selvi', password: staffPasswords, subjectId: createdSubjects[2]._id, subjectName: createdSubjects[2].name },
      { name: 'Dhanalakshmi', staffId: 'STAFF004', username: 'dhanalakshmi', password: staffPasswords, subjectId: createdSubjects[3]._id, subjectName: createdSubjects[3].name }
    ];

    const createdStaff = await Staff.insertMany(staffData);

    // Update subjects with staff IDs
    for (let i = 0; i < createdSubjects.length; i++) {
      createdSubjects[i].staffId = createdStaff[i]._id;
      await createdSubjects[i].save();
    }

    console.log('Creating students...');
    const studentPassword = await bcrypt.hash('student123', 10);
    const allSubjectNames = createdSubjects.map(s => s.name);

    const studentsData = [
      { name: 'Aarthi C',           studentId: '25PCA04001', username: '25pca04001', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Anushiya S',         studentId: '25PCA04002', username: '25pca04002', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Bhavyasri K',        studentId: '25PCA04003', username: '25pca04003', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Bhuvaneshwari R',    studentId: '25PCA04004', username: '25pca04004', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Deepika V',          studentId: '25PCA04005', username: '25pca04005', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Dhanamani V',        studentId: '25PCA04006', username: '25pca04006', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Divyasri K',         studentId: '25PCA04007', username: '25pca04007', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Gowthami V',         studentId: '25PCA04009', username: '25pca04009', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Harshika E',         studentId: '25PCA04010', username: '25pca04010', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Hindu V',            studentId: '25PCA04041', username: '25pca04041', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Indira S',           studentId: '25PCA04011', username: '25pca04011', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Janani S',           studentId: '25PCA04012', username: '25pca04012', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Kavitha S',          studentId: '25PCA04013', username: '25pca04013', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Kaviya S',           studentId: '25PCA04014', username: '25pca04014', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Keerthika A',        studentId: '25PCA04015', username: '25pca04015', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Kiruba M',           studentId: '25PCA04016', username: '25pca04016', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Kowsalyadevi S',     studentId: '25PCA04017', username: '25pca04017', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Nandhini V',         studentId: '25PCA04018', username: '25pca04018', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Nandini Govindan',   studentId: '25PCA04019', username: '25pca04019', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Nisha R',            studentId: '25PCA04020', username: '25pca04020', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Pavithra S',         studentId: '25PCA04021', username: '25pca04021', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Pooja G',            studentId: '25PCA04042', username: '25pca04042', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Pooja S',            studentId: '25PCA04022', username: '25pca04022', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Priyadharshini S',   studentId: '25PCA04023', username: '25pca04023', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Rehana S',           studentId: '25PCA04024', username: '25pca04024', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Roobiga R',          studentId: '25PCA04025', username: '25pca04025', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Samyuktha S',        studentId: '25PCA04026', username: '25pca04026', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Sandhiya S',         studentId: '25PCA04028', username: '25pca04028', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Sangavi L',          studentId: '25PCA04029', username: '25pca04029', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Santhiya B',         studentId: '25PCA04027', username: '25pca04027', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Saran Priya M',      studentId: '25PCA04030', username: '25pca04030', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Saranya S',          studentId: '25PCA04031', username: '25pca04031', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Sneka T',            studentId: '25PCA04032', username: '25pca04032', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Sowmiya K',          studentId: '25PCA04033', username: '25pca04033', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Suganthi M',         studentId: '25PCA04034', username: '25pca04034', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Swathi D',           studentId: '25PCA04036', username: '25pca04036', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Swathi M',           studentId: '25PCA04035', username: '25pca04035', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Swathi S',           studentId: '25PCA04037', username: '25pca04037', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Swetha N',           studentId: '25PCA04038', username: '25pca04038', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Tharanika A',        studentId: '25PCA04043', username: '25pca04043', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Vidhya B',           studentId: '25PCA04039', username: '25pca04039', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
      { name: 'Vimala V',           studentId: '25PCA04040', username: '25pca04040', password: studentPassword, department: 'Computer Applications', year: 1, subjects: allSubjectNames },
    ];

    await Student.insertMany(studentsData);

    console.log('Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Staff Accounts (password: staff123):');
    staffData.forEach(s => console.log(`  Username: ${s.username}  |  Name: ${s.name}  |  Subject: ${s.subjectName}`));
    console.log('\nStudent Accounts (password: student123):');
    console.log('  Username = Register Number (lowercase), e.g:');
    studentsData.slice(0, 5).forEach(s => console.log(`  Username: ${s.username}  |  Name: ${s.name}  |  Reg No: ${s.studentId}`));
    console.log(`  ... and ${studentsData.length - 5} more students`);
    console.log(`\nTotal students seeded: ${studentsData.length}`);
    console.log('----------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
