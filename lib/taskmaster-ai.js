const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * Taskmaster AI - En AI-driven projekthanterare och task-automatiserare
 */
class TaskmasterAI extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      apiKey: config.apiKey,
      configPath: config.configPath || './taskmaster.config.json',
      workspaceRoot: config.workspaceRoot || process.cwd(),
      autoSave: config.autoSave !== false,
      ...config
    };
    
    this.tasks = new Map();
    this.workflows = new Map();
    this.isConnected = false;
    this.watchers = [];
    
    // Läs in konfiguration
    this.loadConfig();
  }

  async loadConfig() {
    try {
      if (await this.fileExists(this.config.configPath)) {
        const configData = await fs.readFile(this.config.configPath, 'utf8');
        this.projectConfig = JSON.parse(configData);
        this.emit('configLoaded', this.projectConfig);
      }
    } catch (error) {
      this.emit('warning', { message: `Kunde inte ladda config: ${error.message}` });
    }
  }

  async connect() {
    try {
      // Simulera anslutning till AI-tjänst
      await this.delay(1000);
      
      this.isConnected = true;
      this.emit('connected');
      
      // Starta automatiska AI-analyser
      this.startAIAnalysis();
      
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async loadTasks(taskData) {
    try {
      if (taskData.projectTasks) {
        for (const task of taskData.projectTasks) {
          this.tasks.set(task.id, {
            ...task,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (taskData.workflows) {
        for (const workflow of taskData.workflows) {
          this.workflows.set(workflow.name, workflow);
        }
      }

      this.emit('tasksLoaded', { 
        taskCount: this.tasks.size, 
        workflowCount: this.workflows.size 
      });
      
      return true;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async createTask(taskConfig) {
    const task = {
      id: this.generateTaskId(),
      name: taskConfig.name,
      description: taskConfig.description,
      priority: taskConfig.priority || 'medium',
      estimatedTime: taskConfig.estimatedTime || '1h',
      dependencies: taskConfig.dependencies || [],
      automatable: taskConfig.automatable !== false,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      ...taskConfig
    };

    this.tasks.set(task.id, task);
    this.emit('taskCreated', task);

    if (this.config.autoSave) {
      await this.saveTasks();
    }

    return task;
  }

  async executeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} hittades inte`);
    }

    try {
      this.emit('taskStarted', task);
      
      // Simulera task-exekvering med AI-analys
      task.status = 'running';
      task.progress = 0;
      task.updatedAt = new Date();

      // Progressiv uppdatering
      for (let progress = 0; progress <= 100; progress += 25) {
        await this.delay(500);
        task.progress = progress;
        this.emit('taskProgress', { task, progress });
      }

      // Markera som slutförd
      task.status = 'completed';
      task.completedAt = new Date();
      task.progress = 100;

      this.emit('taskCompleted', task);
      
      // AI-analys och förslag
      await this.analyzeTaskCompletion(task);

      return {
        success: true,
        task: task,
        executionTime: task.completedAt - task.updatedAt,
        suggestions: await this.generateSuggestions(task)
      };

    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = new Date();
      
      this.emit('taskFailed', { task, error });
      throw error;
    }
  }

  async getStatus() {
    const tasksByStatus = {};
    const priorities = { high: 0, medium: 0, low: 0 };
    let totalEstimatedTime = 0;

    for (const [id, task] of this.tasks) {
      // Gruppera efter status
      if (!tasksByStatus[task.status]) {
        tasksByStatus[task.status] = [];
      }
      tasksByStatus[task.status].push(task);

      // Räkna prioriteter
      if (priorities.hasOwnProperty(task.priority)) {
        priorities[task.priority]++;
      }

      // Beräkna total estimerad tid
      if (task.status !== 'completed') {
        const hours = this.parseEstimatedTime(task.estimatedTime);
        totalEstimatedTime += hours;
      }
    }

    return {
      totalTasks: this.tasks.size,
      tasksByStatus,
      priorities,
      workflows: this.workflows.size,
      estimatedTimeRemaining: `${totalEstimatedTime}h`,
      projectHealth: this.calculateProjectHealth(),
      aiSuggestions: await this.generateProjectSuggestions()
    };
  }

  watchFiles(patterns) {
    // Simulerad filövervakning
    console.log(`👀 Övervakar filer: ${patterns.join(', ')}`);
    
    // I en riktig implementation skulle vi använda fs.watch eller chokidar
    const watcherInterval = setInterval(async () => {
      try {
        const changes = await this.detectFileChanges();
        if (changes.length > 0) {
          this.emit('filesChanged', changes);
          await this.analyzeFileChanges(changes);
        }
      } catch (error) {
        this.emit('warning', { message: `Filövervakning fel: ${error.message}` });
      }
    }, 5000);

    this.watchers.push(watcherInterval);
  }

  watchGit() {
    console.log('📁 Övervakar Git-aktivitet...');
    
    const gitWatcher = setInterval(async () => {
      try {
        const gitStatus = await this.getGitStatus();
        if (gitStatus.hasChanges) {
          this.emit('gitActivity', gitStatus);
          await this.analyzeGitChanges(gitStatus);
        }
      } catch (error) {
        this.emit('warning', { message: `Git-övervakning fel: ${error.message}` });
      }
    }, 10000);

    this.watchers.push(gitWatcher);
  }

  schedule(cronPattern, workflowName) {
    console.log(`⏰ Schemalägg workflow "${workflowName}" med pattern: ${cronPattern}`);
    
    // I en riktig implementation skulle vi använda node-cron
    // För nu simulerar vi bara schemaläggning
    this.emit('workflowScheduled', { cronPattern, workflowName });
  }

  // === AI-FUNKTIONER ===

  async startAIAnalysis() {
    console.log('🧠 Startar kontinuerlig AI-analys...');
    
    const analysisInterval = setInterval(async () => {
      try {
        await this.performAIAnalysis();
      } catch (error) {
        this.emit('warning', { message: `AI-analys fel: ${error.message}` });
      }
    }, 30000); // Var 30:e sekund

    this.watchers.push(analysisInterval);
  }

  async performAIAnalysis() {
    // Simulerad AI-analys + problemdetektering
    const insights = {
      blockedTasks: this.findBlockedTasks(),
      optimizationSuggestions: await this.generateOptimizationSuggestions(),
      riskAssessment: this.assessProjectRisks(),
      nextRecommendedActions: this.getRecommendedNextActions(),
      codeProblems: await this.detectCodeProblems()
    };

    if (insights.blockedTasks.length > 0) {
      this.emit('suggestion', {
        type: 'blocked_tasks',
        message: `${insights.blockedTasks.length} tasks är blockerade och behöver uppmärksamhet`,
        data: insights.blockedTasks
      });
    }

    if (insights.riskAssessment.level === 'high') {
      this.emit('warning', {
        message: `Hög risk identifierad: ${insights.riskAssessment.reason}`,
        data: insights.riskAssessment
      });
    }

    // Kod-problem detektion
    if (insights.codeProblems.length > 0) {
      this.emit('warning', {
        type: 'code_problems',
        message: `${insights.codeProblems.length} kodproblem detekterade som bör åtgärdas`,
        data: insights.codeProblems
      });
    }

    return insights;
  }

  async generateSuggestions(task) {
    // AI-genererade förslag baserat på task
    const suggestions = [
      `Överväg att automatisera liknande tasks som "${task.name}"`,
      `Tasks av typen "${task.priority}" priority bör få mer resurser`,
      `Dokumentera processen för "${task.name}" för framtida automatisering`
    ];

    return suggestions;
  }

  async generateProjectSuggestions() {
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed');
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');

    const suggestions = [];

    if (pendingTasks.length > completedTasks.length) {
      suggestions.push('Fokusera på att slutföra befintliga tasks innan nya läggs till');
    }

    if (pendingTasks.some(t => t.priority === 'high')) {
      suggestions.push('Det finns högprioriterade tasks som behöver omedelbar uppmärksamhet');
    }

    return suggestions;
  }

  // === HJÄLPFUNKTIONER ===

  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  parseEstimatedTime(timeString) {
    const match = timeString.match(/(\d+)h?/);
    return match ? parseInt(match[1]) : 1;
  }

  calculateProjectHealth() {
    const tasks = Array.from(this.tasks.values());
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    
    if (total === 0) return 'unknown';
    
    const completionRate = completed / total;
    if (completionRate > 0.8) return 'excellent';
    if (completionRate > 0.6) return 'good';
    if (completionRate > 0.4) return 'fair';
    return 'needs_attention';
  }

  findBlockedTasks() {
    return Array.from(this.tasks.values()).filter(task => {
      return task.dependencies.some(depId => {
        const dep = this.tasks.get(depId);
        return dep && dep.status !== 'completed';
      });
    });
  }

  async generateOptimizationSuggestions() {
    return [
      'Överväg att parallellkör oberoende tasks',
      'Automatisera repetitiva kvalitetskontroller',
      'Implementera CI/CD för snabbare feedback-loop'
    ];
  }

  assessProjectRisks() {
    const highPriorityPending = Array.from(this.tasks.values())
      .filter(t => t.priority === 'high' && t.status === 'pending').length;
    
    if (highPriorityPending > 3) {
      return { level: 'high', reason: 'För många högprioriterade tasks är opåbörjade' };
    }
    
    return { level: 'low', reason: 'Projektet verkar vara på rätt spår' };
  }

  getRecommendedNextActions() {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    return pendingTasks.slice(0, 3).map(task => ({
      taskId: task.id,
      name: task.name,
      reason: `Högprioriterad task som bör påbörjas`
    }));
  }

  async detectFileChanges() {
    // Simulerad filförändringsdetektering
    return Math.random() > 0.8 ? ['package.json'] : [];
  }

  async getGitStatus() {
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.config.workspaceRoot,
        encoding: 'utf8' 
      });
      
      return {
        hasChanges: status.trim().length > 0,
        files: status.trim().split('\n').filter(line => line.length > 0)
      };
    } catch {
      return { hasChanges: false, files: [] };
    }
  }

  async analyzeFileChanges(changes) {
    this.emit('suggestion', {
      type: 'file_changes',
      message: `Filer har ändrats: ${changes.join(', ')}. Överväg att köra tester.`,
      data: changes
    });
  }

  async analyzeGitChanges(gitStatus) {
    if (gitStatus.files.length > 10) {
      this.emit('suggestion', {
        type: 'large_changeset',
        message: 'Stora ändringar detekterade. Överväg att dela upp i mindre commits.',
        data: gitStatus
      });
    }
  }

  async analyzeTaskCompletion(task) {
    // AI-analys av slutförd task
    const insight = `Task "${task.name}" slutförd. Liknande tasks kan automatiseras i framtiden.`;
    
    this.emit('suggestion', {
      type: 'task_completion',
      message: insight,
      data: { task, automationPotential: task.automatable }
    });
  }

  // Ny metod för problemdetektering
  async detectCodeProblems() {
    try {
      // Simulera VS Code problem detection
      const problems = [];
      
      // Kontrollera TypeScript fel
      try {
        execSync('npx tsc --noEmit --skipLibCheck', { 
          cwd: this.config.workspaceRoot,
          stdio: 'pipe'
        });
      } catch (error) {
        if (error.stdout && error.stdout.includes('error TS')) {
          const errorCount = (error.stdout.match(/error TS/g) || []).length;
          problems.push({
            type: 'typescript',
            severity: 'error',
            count: errorCount,
            message: `${errorCount} TypeScript fel detekterade`,
            suggestion: 'Kör "npx tsc --noEmit" för detaljer'
          });
        }
      }

      // Kontrollera ESLint problem
      try {
        execSync('npx eslint . --ext .ts,.js --format compact', {
          cwd: this.config.workspaceRoot,
          stdio: 'pipe'
        });
      } catch (error) {
        if (error.stdout && error.stdout.includes('problem')) {
          const problemCount = (error.stdout.match(/problem/g) || []).length;
          problems.push({
            type: 'eslint',
            severity: 'warning',
            count: problemCount,
            message: `${problemCount} ESLint problem detekterade`,
            suggestion: 'Kör "npm run lint:fix" för att fixa automatiskt'
          });
        }
      }

      // Kontrollera saknade beroenden
      const packageJson = require(path.join(this.config.workspaceRoot, 'package.json'));
      const installedPackages = Object.keys(require(path.join(this.config.workspaceRoot, 'node_modules')));
      
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };
      
      const missingDeps = Object.keys(allDeps).filter(dep => !installedPackages.includes(dep));
      
      if (missingDeps.length > 0) {
        problems.push({
          type: 'dependencies',
          severity: 'error',
          count: missingDeps.length,
          message: `${missingDeps.length} saknade beroenden: ${missingDeps.slice(0, 3).join(', ')}`,
          suggestion: 'Kör "npm install" för att installera saknade paket'
        });
      }

      return problems;
    } catch (error) {
      // Om problemdetektering failar, returnera tom array
      return [];
    }
  }

  async saveTasks() {
    try {
      const tasksDir = path.join(this.config.workspaceRoot, 'tasks');
      await fs.mkdir(tasksDir, { recursive: true });
      
      const tasksData = {
        projectTasks: Array.from(this.tasks.values()),
        workflows: Array.from(this.workflows.values()),
        lastUpdated: new Date().toISOString()
      };

      await fs.writeFile(
        path.join(tasksDir, 'current-tasks.json'),
        JSON.stringify(tasksData, null, 2)
      );
      
    } catch (error) {
      this.emit('warning', { message: `Kunde inte spara tasks: ${error.message}` });
    }
  }

  // Stäng ner Taskmaster AI och rensa resurser
  async shutdown() {
    console.log('🔄 Stänger ner Taskmaster AI...');
    
    // Stoppa alla watchers
    this.watchers.forEach(watcher => {
      if (typeof watcher === 'number') {
        clearInterval(watcher);
      }
    });
    
    // Spara aktuellt tillstånd
    if (this.config.autoSave) {
      await this.saveTasks();
    }
    
    this.isConnected = false;
    this.emit('shutdown');
    
    console.log('✅ Taskmaster AI avstängd');
  }
}

module.exports = TaskmasterAI;