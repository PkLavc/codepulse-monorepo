import { Judge0Service } from './src/services/judge0.service.js';

console.log('Testing Judge0Service import...');
const service = new Judge0Service();
console.log('✅ Judge0Service imported and instantiated successfully!');
console.log('Service methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)).filter(name => name !== 'constructor'));