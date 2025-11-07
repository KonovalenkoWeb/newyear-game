const TaskmasterAI = require('./lib/taskmaster-ai');

(async () => {
  console.log('🔍 Testar FIXAD Taskmaster AI problemdetektering...');
  
  const taskmaster = new TaskmasterAI({
    workspaceRoot: process.cwd()
  });
  
  try {
    const problems = await taskmaster.detectCodeProblems();
    console.log(`\n📊 Detected problems: ${problems.length}`);
    
    problems.forEach((problem, i) => {
      console.log(`${i+1}. [${problem.severity.toUpperCase()}] ${problem.type}: ${problem.message}`);
      console.log(`   💡 ${problem.suggestion}`);
      if (problem.details) {
        console.log(`   🔍 Exempel: ${problem.details[0]}`);
      }
      console.log('');
    });
    
    if (problems.length === 0) {
      console.log('⚠️ Fortfarande inga problem detekterade - behöver mer felsökning');
    } else {
      console.log(`✅ Taskmaster AI detekterar nu ${problems.length} problem!`);
    }
  } catch (error) {
    console.error('❌ Fel i problemdetektering:', error.message);
  }
})();