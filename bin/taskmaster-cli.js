#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ProjectTaskmaster = require('../index');

program
  .name('taskmaster')
  .description('Taskmaster AI - Intelligent projekthantering och automatisering')
  .version('1.0.0');

// Huvudkommando - starta Taskmaster AI
program
  .command('start')
  .description('Starta Taskmaster AI för kontinuerlig övervakning')
  .option('-d, --daemon', 'Kör i bakgrunden')
  .action(async (options) => {
    console.log(chalk.blue('🤖 Startar Taskmaster AI...'));
    
    const taskmaster = new ProjectTaskmaster();
    await taskmaster.initialize();
    
    if (options.daemon) {
      console.log(chalk.green('🔄 Kör i daemon-mode (Ctrl+C för att stoppa)'));
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n🔄 Stänger ner Taskmaster AI...'));
        process.exit(0);
      });
    } else {
      console.log(chalk.yellow('💡 Tryck Ctrl+C för att stoppa'));
    }
  });

// Status-kommando
program
  .command('status')
  .description('Visa aktuell projektstatus och AI-insikter')
  .action(async () => {
    console.log(chalk.blue('📊 Hämtar projektstatus...'));
    
    const taskmaster = new ProjectTaskmaster();
    await taskmaster.initialize();
    
    const status = await taskmaster.getStatus();
    
    console.log(chalk.green('\n=== PROJEKTSTATUS ==='));
    console.log(`📋 Totalt antal tasks: ${status.totalTasks}`);
    console.log(`⏳ Estimerad återstående tid: ${status.estimatedTimeRemaining}`);
    console.log(`🏥 Projekthälsa: ${getHealthEmoji(status.projectHealth)} ${status.projectHealth}`);
    
    if (status.tasksByStatus) {
      console.log(chalk.yellow('\n📈 Tasks per status:'));
      for (const [statusType, tasks] of Object.entries(status.tasksByStatus)) {
        console.log(`  ${getStatusEmoji(statusType)} ${statusType}: ${tasks.length}`);
      }
    }
    
    if (status.aiSuggestions && status.aiSuggestions.length > 0) {
      console.log(chalk.cyan('\n💡 AI-förslag:'));
      status.aiSuggestions.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion}`);
      });
    }
  });

// Skapa ny task
program
  .command('create-task')
  .description('Skapa en ny task med AI-assistans')
  .action(async () => {
    console.log(chalk.blue('📝 Skapa ny task med AI-assistans\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Namn på task:',
        validate: input => input.length > 0 || 'Namn krävs'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Beskrivning:'
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Prioritet:',
        choices: ['high', 'medium', 'low'],
        default: 'medium'
      },
      {
        type: 'input',
        name: 'estimatedTime',
        message: 'Estimerad tid (t.ex. "2h", "30m"):',
        default: '1h'
      },
      {
        type: 'confirm',
        name: 'automatable',
        message: 'Kan denna task automatiseras?',
        default: true
      }
    ]);
    
    const taskmaster = new ProjectTaskmaster();
    await taskmaster.initialize();
    
    const task = await taskmaster.createTask(answers.name, answers.description, {
      priority: answers.priority,
      estimatedTime: answers.estimatedTime,
      automatable: answers.automatable
    });
    
    console.log(chalk.green(`\n✅ Task skapad: ${task.id}`));
    console.log(chalk.gray(`   Namn: ${task.name}`));
    console.log(chalk.gray(`   Prioritet: ${task.priority}`));
    console.log(chalk.gray(`   Estimerad tid: ${task.estimatedTime}`));
  });

// Utför task
program
  .command('execute')
  .description('Utför en specifik task eller låt AI välja')
  .option('-i, --interactive', 'Interaktiv lägesval av task')
  .option('-t, --task-id <id>', 'Specifik task ID att utföra')
  .action(async (options) => {
    const taskmaster = new ProjectTaskmaster();
    await taskmaster.initialize();
    
    let taskId = options.taskId;
    
    if (options.interactive && !taskId) {
      const status = await taskmaster.getStatus();
      const pendingTasks = [];
      
      for (const [statusType, tasks] of Object.entries(status.tasksByStatus)) {
        if (statusType === 'pending') {
          pendingTasks.push(...tasks);
        }
      }
      
      if (pendingTasks.length === 0) {
        console.log(chalk.yellow('📭 Inga väntande tasks hittades'));
        return;
      }
      
      const choices = pendingTasks.map(task => ({
        name: `${task.name} (${task.priority} priority, ${task.estimatedTime})`,
        value: task.id
      }));
      
      const { selectedTaskId } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedTaskId',
        message: 'Välj task att utföra:',
        choices
      }]);
      
      taskId = selectedTaskId;
    }
    
    if (!taskId) {
      console.log(chalk.red('❌ Task ID krävs. Använd --task-id eller --interactive'));
      return;
    }
    
    console.log(chalk.blue(`🏃 Utför task: ${taskId}`));
    
    try {
      const result = await taskmaster.executeTask(taskId);
      
      console.log(chalk.green(`\n✅ Task slutförd framgångsrikt!`));
      console.log(chalk.gray(`   Exekveringstid: ${result.executionTime}ms`));
      
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(chalk.cyan('\n💡 AI-förslag:'));
        result.suggestions.forEach((suggestion, i) => {
          console.log(`  ${i + 1}. ${suggestion}`);
        });
      }
      
    } catch (error) {
      console.log(chalk.red(`❌ Task misslyckades: ${error.message}`));
    }
  });

// Plan-kommando - AI skapar en plan
program
  .command('plan')
  .description('Låt AI skapa en smart plan för projektet')
  .option('-g, --goal <goal>', 'Specificera projektmål')
  .action(async (options) => {
    console.log(chalk.blue('🧠 AI skapar en smart projektplan...'));
    
    let goal = options.goal;
    
    if (!goal) {
      const { projectGoal } = await inquirer.prompt([{
        type: 'input',
        name: 'projectGoal',
        message: 'Vad är projektets huvudmål?',
        default: 'Slutföra alla aktuella tasks och optimera arbetsflusset'
      }]);
      
      goal = projectGoal;
    }
    
    const taskmaster = new ProjectTaskmaster();
    await taskmaster.initialize();
    
    // Simulera AI-planering
    console.log(chalk.yellow('\n🤖 AI analyserar projektet...'));
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(chalk.green('\n📋 AI-GENERERAD PROJEKTPLAN'));
    console.log(chalk.gray(`Mål: ${goal}\n`));
    
    const aiPlan = [
      '1. 🔍 Analysera befintliga tasks och identifiera beroenden',
      '2. 📊 Prioritera tasks baserat på värde och risk',
      '3. ⚡ Automatisera repetitiva processer',
      '4. 🔄 Implementera kontinuerlig övervakning',
      '5. 📈 Optimera arbetsflöden för maximal effektivitet',
      '6. ✅ Validera resultat och justera strategi'
    ];
    
    aiPlan.forEach(step => console.log(step));
    
    console.log(chalk.cyan('\n💡 Rekommendationer:'));
    console.log('• Börja med högprioriterade tasks');
    console.log('• Automatisera kod-kvalitetskontroller');
    console.log('• Sätt upp dagliga AI-analyser');
    console.log('• Implementera real-time feedback loops');
  });

// Hjälpfunktioner
function getHealthEmoji(health) {
  const emojis = {
    excellent: '🌟',
    good: '✅',
    fair: '⚠️',
    needs_attention: '🔥',
    unknown: '❓'
  };
  return emojis[health] || '❓';
}

function getStatusEmoji(status) {
  const emojis = {
    pending: '⏳',
    running: '🏃',
    completed: '✅',
    failed: '❌',
    blocked: '🚫'
  };
  return emojis[status] || '📋';
}

// Kör CLI
if (require.main === module) {
  program.parse();
}

module.exports = program;