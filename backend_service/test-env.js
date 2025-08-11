require('dotenv').config();

console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY);
console.log('API Key length:', process.env.DASHSCOPE_API_KEY ? process.env.DASHSCOPE_API_KEY.length : 'undefined');
console.log('API Key starts with sk-:', process.env.DASHSCOPE_API_KEY ? process.env.DASHSCOPE_API_KEY.startsWith('sk-') : 'undefined');