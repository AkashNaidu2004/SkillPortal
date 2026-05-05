const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const User = require('./models/User');
const Category = require('./models/Category');
const Test = require('./models/Test');
const Question = require('./models/Question');
const Result = require('./models/Result');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Test.deleteMany({});
    await Question.deleteMany({});
    await Result.deleteMany({});

    // Create users
    const admin = await User.create({
      name: 'Admin User', email: 'admin@skillportal.com', password: 'admin123', role: 'admin',
    });
    const student = await User.create({
      name: 'John Doe', email: 'student@skillportal.com', password: 'student123', role: 'student',
    });
    console.log('✅ Users created');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'Aptitude', description: 'Numerical and quantitative aptitude tests', icon: '🧮' },
      { name: 'Logical Reasoning', description: 'Pattern recognition and logical thinking', icon: '🧩' },
      { name: 'Verbal Ability', description: 'English comprehension and vocabulary', icon: '📖' },
      { name: 'Technical MCQ', description: 'Programming and CS fundamentals', icon: '💻' },
      { name: 'Coding Tests', description: 'Hands-on coding challenges', icon: '⌨️' },
    ]);
    console.log('✅ Categories created');

    // Create tests
    const aptitudeTest = await Test.create({
      title: 'Quantitative Aptitude - Set 1',
      categoryId: categories[0]._id, duration: 30, type: 'mcq', difficulty: 'medium',
      description: 'Test your numerical ability with 10 questions on percentages, ratios, and time & work.',
    });
    const logicTest = await Test.create({
      title: 'Logical Reasoning - Patterns',
      categoryId: categories[1]._id, duration: 25, type: 'mcq', difficulty: 'medium',
      description: 'Identify patterns, sequences, and logical relationships.',
    });
    const verbalTest = await Test.create({
      title: 'Verbal Ability - Comprehension',
      categoryId: categories[2]._id, duration: 20, type: 'mcq', difficulty: 'easy',
      description: 'Reading comprehension, synonyms, antonyms, and sentence completion.',
    });
    const techTest = await Test.create({
      title: 'Data Structures & Algorithms',
      categoryId: categories[3]._id, duration: 30, type: 'mcq', difficulty: 'hard',
      description: 'Test your knowledge of arrays, linked lists, trees, and graph algorithms.',
    });
    const codingTest = await Test.create({
      title: 'Python Coding Challenge',
      categoryId: categories[4]._id, duration: 45, type: 'coding', difficulty: 'medium',
      description: 'Solve coding problems using Python. Test cases will be evaluated automatically.',
    });
    console.log('✅ Tests created');

    // Create questions - Aptitude
    const aptitudeQuestions = [
      { testId: aptitudeTest._id, type: 'mcq', questionText: 'If 20% of a number is 40, what is the number?', options: ['100', '200', '150', '250'], correctAnswer: '200', difficulty: 'easy' },
      { testId: aptitudeTest._id, type: 'mcq', questionText: 'A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/hr?', options: ['36', '42', '48', '54'], correctAnswer: '36', difficulty: 'medium' },
      { testId: aptitudeTest._id, type: 'mcq', questionText: 'The ratio of ages of A and B is 3:5. If the sum of their ages is 48, what is the age of B?', options: ['18', '24', '30', '36'], correctAnswer: '30', difficulty: 'easy' },
      { testId: aptitudeTest._id, type: 'mcq', questionText: 'If the simple interest on Rs. 5000 for 3 years is Rs. 1200, what is the rate of interest?', options: ['6%', '8%', '10%', '12%'], correctAnswer: '8%', difficulty: 'medium' },
      { testId: aptitudeTest._id, type: 'mcq', questionText: 'A can do a piece of work in 10 days, B can do it in 15 days. How many days will they take together?', options: ['4', '5', '6', '7'], correctAnswer: '6', difficulty: 'medium' },
    ];

    // Logical reasoning questions
    const logicQuestions = [
      { testId: logicTest._id, type: 'mcq', questionText: 'What comes next in the series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], correctAnswer: '42', difficulty: 'medium' },
      { testId: logicTest._id, type: 'mcq', questionText: 'If APPLE is coded as 50, then MANGO is coded as?', options: ['57', '59', '61', '63'], correctAnswer: '57', difficulty: 'medium' },
      { testId: logicTest._id, type: 'mcq', questionText: 'Find the odd one out: 3, 5, 11, 14, 17, 21', options: ['14', '21', '11', '5'], correctAnswer: '14', difficulty: 'easy' },
      { testId: logicTest._id, type: 'mcq', questionText: 'If all roses are flowers, and some flowers fade quickly, which statement is true?', options: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade quickly', 'None of the above'], correctAnswer: 'Some roses may fade quickly', difficulty: 'medium' },
      { testId: logicTest._id, type: 'mcq', questionText: 'A is the brother of B. B is the sister of C. How is C related to A?', options: ['Brother', 'Sister', 'Sibling', 'Cannot be determined'], correctAnswer: 'Cannot be determined', difficulty: 'easy' },
    ];

    // Verbal ability questions
    const verbalQuestions = [
      { testId: verbalTest._id, type: 'mcq', questionText: 'Choose the synonym of "Eloquent":', options: ['Silent', 'Fluent', 'Ambiguous', 'Hostile'], correctAnswer: 'Fluent', difficulty: 'easy' },
      { testId: verbalTest._id, type: 'mcq', questionText: 'Choose the antonym of "Benevolent":', options: ['Kind', 'Malevolent', 'Gentle', 'Generous'], correctAnswer: 'Malevolent', difficulty: 'easy' },
      { testId: verbalTest._id, type: 'mcq', questionText: 'Fill in the blank: "The manager ___ the proposal after careful consideration."', options: ['accepted', 'excepted', 'expect', 'access'], correctAnswer: 'accepted', difficulty: 'easy' },
      { testId: verbalTest._id, type: 'mcq', questionText: 'Which sentence is grammatically correct?', options: ['He don\'t know the answer.', 'He doesn\'t knows the answer.', 'He doesn\'t know the answer.', 'He don\'t knows the answer.'], correctAnswer: 'He doesn\'t know the answer.', difficulty: 'easy' },
      { testId: verbalTest._id, type: 'mcq', questionText: 'Choose the correctly spelt word:', options: ['Occurence', 'Occurrence', 'Ocurrence', 'Occurance'], correctAnswer: 'Occurrence', difficulty: 'easy' },
    ];

    // Technical MCQ questions
    const techQuestions = [
      { testId: techTest._id, type: 'mcq', questionText: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 'O(log n)', difficulty: 'easy' },
      { testId: techTest._id, type: 'mcq', questionText: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correctAnswer: 'Stack', difficulty: 'easy' },
      { testId: techTest._id, type: 'mcq', questionText: 'What is the worst-case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 'O(n²)', difficulty: 'medium' },
      { testId: techTest._id, type: 'mcq', questionText: 'Which traversal of a BST gives elements in sorted order?', options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'], correctAnswer: 'Inorder', difficulty: 'medium' },
      { testId: techTest._id, type: 'mcq', questionText: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 'O(n)', difficulty: 'hard' },
    ];

    // Coding questions
    const codingQuestions = [
      {
        testId: codingTest._id, type: 'coding', difficulty: 'easy',
        questionText: 'Write a function that takes a list of integers and returns the sum of all even numbers.',
        constraints: '1 ≤ len(arr) ≤ 1000, -1000 ≤ arr[i] ≤ 1000',
        sampleInput: '[1, 2, 3, 4, 5, 6]',
        sampleOutput: '12',
        testCases: [
          { input: '[1, 2, 3, 4, 5, 6]', expectedOutput: '12' },
          { input: '[2, 4, 6, 8]', expectedOutput: '20' },
          { input: '[1, 3, 5]', expectedOutput: '0' },
        ],
      },
      {
        testId: codingTest._id, type: 'coding', difficulty: 'medium',
        questionText: 'Write a function to check if a given string is a palindrome. Ignore case and non-alphanumeric characters.',
        constraints: '1 ≤ len(s) ≤ 10000',
        sampleInput: '"A man, a plan, a canal: Panama"',
        sampleOutput: 'True',
        testCases: [
          { input: '"racecar"', expectedOutput: 'True' },
          { input: '"hello"', expectedOutput: 'False' },
          { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'True' },
        ],
      },
      {
        testId: codingTest._id, type: 'coding', difficulty: 'medium',
        questionText: 'Write a function to find the longest common prefix among a list of strings. If there is no common prefix, return an empty string.',
        constraints: '1 ≤ len(strs) ≤ 200, 0 ≤ len(strs[i]) ≤ 200',
        sampleInput: '["flower", "flow", "flight"]',
        sampleOutput: '"fl"',
        testCases: [
          { input: '["flower", "flow", "flight"]', expectedOutput: '"fl"' },
          { input: '["dog", "racecar", "car"]', expectedOutput: '""' },
          { input: '["abc"]', expectedOutput: '"abc"' },
        ],
      },
    ];

    const allQuestions = await Question.insertMany([...aptitudeQuestions, ...logicQuestions, ...verbalQuestions, ...techQuestions, ...codingQuestions]);
    console.log('✅ Questions created');

    // -----------------------------------------------
    // Create sample test results with proctoring data
    // -----------------------------------------------
    const aptQ = allQuestions.filter(q => q.testId.toString() === aptitudeTest._id.toString());
    const logQ = allQuestions.filter(q => q.testId.toString() === logicTest._id.toString());
    const verQ = allQuestions.filter(q => q.testId.toString() === verbalTest._id.toString());
    const tecQ = allQuestions.filter(q => q.testId.toString() === techTest._id.toString());
    const codQ = allQuestions.filter(q => q.testId.toString() === codingTest._id.toString());

    await Result.insertMany([
      // Aptitude test — 4/5 correct, 1 violation
      {
        userId: student._id,
        testId: aptitudeTest._id,
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        accuracy: 80,
        timeTaken: 1120,
        violations: 1,
        violationLog: ['Tab switching detected at 10:05:32 AM'],
        answers: aptQ.map((q, i) => ({
          questionId: q._id,
          selectedAnswer: i < 4 ? q.correctAnswer : q.options[0],
          isCorrect: i < 4,
        })),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
      // Logical Reasoning — 3/5 correct, 0 violations (clean test)
      {
        userId: student._id,
        testId: logicTest._id,
        score: 60,
        totalQuestions: 5,
        correctAnswers: 3,
        accuracy: 60,
        timeTaken: 980,
        violations: 0,
        violationLog: [],
        answers: logQ.map((q, i) => ({
          questionId: q._id,
          selectedAnswer: i < 3 ? q.correctAnswer : q.options[2],
          isCorrect: i < 3,
        })),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      // Verbal Ability — 5/5 correct, 0 violations (perfect score)
      {
        userId: student._id,
        testId: verbalTest._id,
        score: 100,
        totalQuestions: 5,
        correctAnswers: 5,
        accuracy: 100,
        timeTaken: 540,
        violations: 0,
        violationLog: [],
        answers: verQ.map((q) => ({
          questionId: q._id,
          selectedAnswer: q.correctAnswer,
          isCorrect: true,
        })),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      // Technical MCQ — 2/5 correct, 2 violations (struggled)
      {
        userId: student._id,
        testId: techTest._id,
        score: 40,
        totalQuestions: 5,
        correctAnswers: 2,
        accuracy: 40,
        timeTaken: 1650,
        violations: 2,
        violationLog: [
          'Window lost focus at 2:15:10 PM',
          'Tab switching detected at 2:22:44 PM',
        ],
        answers: tecQ.map((q, i) => ({
          questionId: q._id,
          selectedAnswer: i < 2 ? q.correctAnswer : q.options[0],
          isCorrect: i < 2,
        })),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      // Coding Challenge — 2/3, 1 violation
      {
        userId: student._id,
        testId: codingTest._id,
        score: 67,
        totalQuestions: 3,
        correctAnswers: 2,
        accuracy: 67,
        timeTaken: 2100,
        violations: 1,
        violationLog: ['Exited fullscreen mode at 4:08:19 PM'],
        answers: codQ.map((q, i) => ({
          questionId: q._id,
          code: i === 0
            ? 'def sum_even(arr):\n    return sum(x for x in arr if x % 2 == 0)'
            : i === 1
            ? 'def is_palindrome(s):\n    s = "".join(c.lower() for c in s if c.isalnum())\n    return s == s[::-1]'
            : 'def longest_prefix(strs):\n    # incomplete\n    pass',
          isCorrect: i < 2,
          passedTestCases: i < 2 ? 3 : 0,
          totalTestCases: 3,
        })),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ]);
    console.log('✅ Sample results with proctoring data created');

    console.log('\n🎉 Seed data complete!');
    console.log('Admin: admin@skillportal.com / admin123');
    console.log('Student: student@skillportal.com / student123');
    console.log('\n📊 Student has 5 pre-loaded test results with proctoring violations');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
