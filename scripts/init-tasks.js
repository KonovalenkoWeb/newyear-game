#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 Initierar Taskmaster AI tasks...');

// Exempel på tasks som Taskmaster AI kan hantera
const exampleTasks = {
  "projectTasks": [
    {
      "id": "task_001",
      "name": "Projektinitialisering",
      "description": "Sätt upp grundläggande projektstruktur och beroenden",
      "priority": "high",
      "estimatedTime": "2h",
      "dependencies": [],
      "automatable": true,
      "status": "pending"
    },
    {
      "id": "task_002", 
      "name": "Kodkvalitetsanalys",
      "description": "Kör automatisk kodgranskning och kvalitetskontroller",
      "priority": "medium",
      "estimatedTime": "30m",
      "dependencies": ["task_001"],
      "automatable": true,
      "status": "pending"
    },
    {
      "id": "task_003",
      "name": "Testning och validering",
      "description": "Kör alla tester och validera funktionalitet",
      "priority": "high",
      "estimatedTime": "1h",
      "dependencies": ["task_002"],
      "automatable": true,
      "status": "pending"
    },
    {
      "id": "task_004",
      "name": "Dokumentationsuppdatering",
      "description": "Uppdatera dokumentation baserat på ändringar",
      "priority": "medium",
      "estimatedTime": "45m",
      "dependencies": ["task_003"],
      "automatable": true,
      "status": "pending"
    }
  ],
  "workflows": [
    {
      "name": "daily-maintenance",
      "description": "Daglig underhållsrutin",
      "schedule": "0 9 * * *",
      "tasks": ["task_002", "task_003"]
    },
    {
      "name": "release-preparation",
      "description": "Förbered för release",
      "trigger": "manual",
      "tasks": ["task_002", "task_003", "task_004"]
    }
  ]
};

// Skapa tasks-mapp om den inte finns
const tasksDir = path.join(__dirname, '..', 'tasks');
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

// Skriv exempel-tasks till fil
const tasksFile = path.join(tasksDir, 'example-tasks.json');
fs.writeFileSync(tasksFile, JSON.stringify(exampleTasks, null, 2));

console.log('✅ Exempel-tasks skapade i:', tasksFile);

// Skapa logs-mapp
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

console.log('✅ Logs-mapp skapad');

console.log('\n📋 Nästa steg:');
console.log('1. Konfigurera API-nycklar i .env fil');
console.log('2. Kör: npm install');
console.log('3. Kör: npm run taskmaster för att starta AI');

console.log('\n🤖 Taskmaster AI är redo att användas!');