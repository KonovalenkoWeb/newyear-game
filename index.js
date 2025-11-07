const TaskmasterAI = require('./lib/taskmaster-ai');
const path = require('path');
require('dotenv').config();

class ProjectTaskmaster {
  constructor() {
    this.taskmaster = new TaskmasterAI({
      apiKey: process.env.TASKMASTER_AI_API_KEY,
      configPath: path.join(__dirname, 'taskmaster.config.json'),
      workspaceRoot: __dirname
    });
    
    this.initializeEventListeners();
  }

  async initialize() {
    console.log('🤖 Startar Taskmaster AI...');
    
    try {
      await this.taskmaster.connect();
      console.log('✅ Taskmaster AI ansluten');
      
      // Ladda befintliga tasks
      await this.loadExistingTasks();
      
      // Starta automatisk övervakning
      await this.startMonitoring();
      
      console.log('🚀 Taskmaster AI är nu aktivt och övervakar projektet');
      
    } catch (error) {
      console.error('❌ Fel vid initialisering av Taskmaster AI:', error.message);
      console.log('💡 Tips: Kontrollera att API-nycklarna är korrekt konfigurerade i .env filen');
    }
  }

  async loadExistingTasks() {
    // Ladda projektspecifik plan för Murderbox
    const projectPlanFile = path.join(__dirname, 'tasks', 'murderbox-project-plan.json');
    const exampleTasksFile = path.join(__dirname, 'tasks', 'example-tasks.json');
    
    if (require('fs').existsSync(projectPlanFile)) {
      const projectPlan = require(projectPlanFile);
      
      // Konvertera projektplan till taskmaster format
      const allTasks = [];
      projectPlan.phases.forEach(phase => {
        allTasks.push(...phase.tasks);
      });
      
      const tasksFormat = {
        projectTasks: allTasks,
        workflows: Object.keys(projectPlan.phases).map(phaseKey => ({
          name: projectPlan.phases[phaseKey]?.name || phaseKey,
          description: projectPlan.phases[phaseKey]?.description || '',
          tasks: projectPlan.phases[phaseKey]?.tasks?.map(t => t.id) || []
        }))
      };
      
      await this.taskmaster.loadTasks(tasksFormat);
      console.log(`📋 Laddat ${allTasks.length} Murderbox projekt-tasks från ${projectPlan.phases.length} faser`);
      
      // Visa projektöversikt
      console.log(`🎭 Projekt: ${projectPlan.projectName} (${projectPlan.projectType})`);
      console.log(`📝 ${projectPlan.description}`);
      
    } else if (require('fs').existsSync(exampleTasksFile)) {
      const tasks = require(exampleTasksFile);
      await this.taskmaster.loadTasks(tasks);
      console.log(`📋 Laddat ${tasks.projectTasks.length} exempel-tasks från fil`);
    }
  }

  async startMonitoring() {
    // Övervaka filförändringar
    this.taskmaster.watchFiles(['**/*.js', '**/*.json', '**/*.md']);
    
    // Övervaka git-aktivitet
    this.taskmaster.watchGit();
    
    // Schemalägg dagliga kontroller
    this.taskmaster.schedule('0 9 * * *', 'daily-maintenance');
  }

  initializeEventListeners() {
    // När en ny task skapas
    this.taskmaster.on('taskCreated', (task) => {
      console.log(`➕ Ny task skapad: ${task.name}`);
    });

    // När en task slutförs
    this.taskmaster.on('taskCompleted', (task) => {
      console.log(`✅ Task slutförd: ${task.name}`);
    });

    // När AI föreslår förbättringar
    this.taskmaster.on('suggestion', (suggestion) => {
      console.log(`💡 AI-förslag: ${suggestion.message}`);
    });

    // Vid fel eller varningar
    this.taskmaster.on('warning', (warning) => {
      console.log(`⚠️  Varning: ${warning.message}`);
    });
  }

  // Metod för att skapa nya tasks programmatiskt
  async createTask(name, description, options = {}) {
    const task = await this.taskmaster.createTask({
      name,
      description,
      priority: options.priority || 'medium',
      estimatedTime: options.estimatedTime || '1h',
      automatable: options.automatable !== false,
      ...options
    });

    console.log(`📝 Skapade ny task: ${name}`);
    return task;
  }

  // Kör specifik task
  async executeTask(taskId) {
    try {
      const result = await this.taskmaster.executeTask(taskId);
      console.log(`🏃 Exekverade task ${taskId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Fel vid exekvering av task ${taskId}:`, error.message);
      throw error;
    }
  }

  // Få status för alla tasks
  async getStatus() {
    const status = await this.taskmaster.getStatus();
    console.log('📊 Projekt status:', status);
    return status;
  }
}

// Starta Taskmaster AI om filen körs direkt
if (require.main === module) {
  const projectTaskmaster = new ProjectTaskmaster();
  projectTaskmaster.initialize();
}

module.exports = ProjectTaskmaster;