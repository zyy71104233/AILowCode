type Role = 'user' | 'pd' | 'arch' |  'proj'|'dev';
export type ActionType = 'confirm' | 'edit' | 'adjust';

interface PromptParts {
  system: string;
  user: string;
}

// 改为直接内联提示词模板
const PROMPT_TEMPLATES: Record<string, PromptParts> = {
  // 用户需求提示词
  'user_confirm': {
    system: `You are a Product Manager, your goal is efficiently create a successful product that meets market demands.`,
    user: `
        只回答一句话。

        `
  },

  // 产品经理确认提示词
  'pd_confirm': {
    system: `You are a Architect, named Bob, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple enough and use  appropriate open source libraries. Use same language as user requirement.`,
    user: `
    只回答一句话。
        
          `
  },

  // 产品经理编辑提示词 (与确认相同)
  'pd_edit': {
    system: `You are a Architect, named Bob, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple enough and use  appropriate open source libraries. Use same language as user requirement.`,
    user: `## context
          {user_input}


          ## format example
          [CONTENT]
          {
              "Implementation approach": "We will ...",
              "File list": [
                  "main.py",
                  "game.py"
              ],
              "Data structures and interfaces": "\nclassDiagram\n    class Main {\n        -SearchEngine search_engine\n        +main() str\n    }\n    class SearchEngine {\n        -Index index\n        -Ranking ranking\n        -Summary summary\n        +search(query: str) str\n    }\n    class Index {\n        -KnowledgeBase knowledge_base\n        +create_index(data: dict)\n        +query_index(query: str) list\n    }\n    class Ranking {\n        +rank_results(results: list) list\n    }\n    class Summary {\n        +summarize_results(results: list) str\n    }\n    class KnowledgeBase {\n        +update(data: dict)\n        +fetch_data(query: str) dict\n    }\n    Main --> SearchEngine\n    SearchEngine --> Index\n    SearchEngine --> Ranking\n    SearchEngine --> Summary\n    Index --> KnowledgeBase\n",
              "Program call flow": "\nsequenceDiagram\n    participant M as Main\n    participant SE as SearchEngine\n    participant I as Index\n    participant R as Ranking\n    participant S as Summary\n    participant KB as KnowledgeBase\n    M->>SE: search(query)\n    SE->>I: query_index(query)\n    I->>KB: fetch_data(query)\n    KB-->>I: return data\n    I-->>SE: return results\n    SE->>R: rank_results(results)\n    R-->>SE: return ranked_results\n    SE->>S: summarize_results(ranked_results)\n    S-->>SE: return summary\n    SE-->>M: return summary\n",
              "Anything UNCLEAR": "Clarification needed on third-party API integration, ..."
          }
          [/CONTENT]

          ## nodes: "<node>: <type>  # <instruction>"
          - Implementation approach: <class 'str'>  # Analyze the difficult points of the requirements, select the appropriate open-source framework
          - File list: typing.List[str]  # Only need relative paths. ALWAYS write a main.py or app.py here
          - Data structures and interfaces: typing.Optional[str]  # Use mermaid classDiagram code syntax, including classes, method(__init__ etc.) and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes, and comply with PEP8 standards. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
          - Program call flow: typing.Optional[str]  # Use sequenceDiagram code syntax, COMPLETE and VERY DETAILED, using CLASSES AND API DEFINED ABOVE accurately, covering the CRUD AND INIT of each object, SYNTAX MUST BE CORRECT.
          - Anything UNCLEAR: <class 'str'>  # Mention unclear project aspects, then try to clarify it.


          ## constraint
          Language: Please use the same language as Human INPUT.
          Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

          ## action
          Follow instructions of nodes, generate output and make sure it follows the format example.
          `
  },

  'pd_adjust': {
    system: `You are a Product Manager, your goal is efficiently create a successful product that meets market demands.`,
    user: `
          基于已有的内容: {adjust_content} 
          根据以下的输入的内容进行优化:{user_input}

          ## context

        ### Project Name


        ### Original Requirements

        {user_input}


        ### Search Information
        -


        -----

        ## format example
        [CONTENT]
        {
            "Language": "en_us",
            "Programming Language": "Python",
            "Original Requirements": "Create a 2048 game",
            "Project Name": "game_2048",
            "Product Goals": [
                "Create an engaging user experience",
                "Improve accessibility, be responsive",
                "More beautiful UI"
            ],
            "User Stories": [
                "As a player, I want to be able to choose difficulty levels",
                "As a player, I want to see my score after each game",
                "As a player, I want to get restart button when I lose",
                "As a player, I want to see beautiful UI that make me feel good",
                "As a player, I want to play game via mobile phone"
            ],
            
            "Requirement Analysis": "",
            "Requirement Pool": [
                [
                    "P0",
                    "The main code ..."
                ],
                [
                    "P0",
                    "The game algorithm ..."
                ]
            ],
            "UI Design draft": "Basic function description with a simple style and layout.",
            "Anything UNCLEAR": ""
        }
        [/CONTENT]

        ## nodes: "<node>: <type>  # <instruction>"
        - Language: <class 'str'>  # Provide the language used in the project, typically matching the user's requirement language.    
        - Programming Language: <class 'str'>  # Python/JavaScript or other mainstream programming language.
        - Original Requirements: <class 'str'>  # Place the original user's requirements here.
        - Project Name: <class 'str'>  # According to the content of "Original Requirements," name the project using snake case style , like 'game_2048' or 'simple_crm.
        - Product Goals: typing.List[str]  # Provide up to three clear, orthogonal product goals.
        - User Stories: typing.List[str]  # Provide up to 3 to 5 scenario-based user stories.    
        - Requirement Analysis: <class 'str'>  # Provide a detailed analysis of the requirements.
        - Requirement Pool: typing.List[typing.List[str]]  # List down the top-5 requirements with their priority (P0, P1, P2).       
        - UI Design draft: <class 'str'>  # Provide a simple description of UI elements, functions, style, and layout.
        - Anything UNCLEAR: <class 'str'>  # Mention any aspects of the project that are unclear and try to clarify them.


        ## constraint
        Language: Please use the same language as Human INPUT.
        Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

        ## action
        Follow instructions of nodes, generate output and make sure it follows the format example.
          `
  },

  // 架构师确认提示词
  'arch_confirm': {
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use same language as user requirement.`,
    user: `
    只回答一句话。
    `
  },

  // 架构师编辑提示词 (与确认相同)
  'arch_edit': {
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use same language as user requirement.`,
    user: `## context
      {user_input}

      -----

      ## format example
      [CONTENT]
      {
          "Required packages": [
              "flask==1.1.2",
              "bcrypt==3.2.0"
          ],
          "Required Other language third-party packages": [
              "No third-party dependencies required"
          ],
          "Logic Analysis": [
              [
                  "game.py",
                  "Contains Game class and ... functions"
              ],
              [
                  "main.py",
                  "Contains main function, from game import Game"
              ]
          ],
          "Task list": [
              "game.py",
              "main.py"
          ],
          "Full API spec": "openapi: 3.0.0 ...",
          "Shared Knowledge": "game.py contains functions shared across the project.",
          "Anything UNCLEAR": "Clarification needed on how to start and initialize third-party libraries."
      }
      [/CONTENT]

      ## nodes: "<node>: <type>  # <instruction>"
      - Required packages: typing.Optional[typing.List[str]]  # Provide required third-party packages in requirements.txt format.   
      - Required Other language third-party packages: typing.List[str]  # List down the required packages for languages other than Python.
      - Logic Analysis: typing.List[typing.List[str]]  # Provide a list of files with the classes/methods/functions to be implemented, including dependency analysis and imports.
      - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.
      - Full API spec: <class 'str'>  # Describe all APIs using OpenAPI 3.0 spec that may be used by both frontend and backend. If front-end and back-end communication is not required, leave it blank.
      - Shared Knowledge: <class 'str'>  # Detail any shared knowledge, like common utility functions or configuration variables.   
      - Anything UNCLEAR: <class 'str'>  # Mention any unclear aspects in the project management context and try to clarify them.   


      ## constraint
      Language: Please use the same language as Human INPUT.
      Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

      ## action
      Follow instructions of nodes, generate output and make sure it follows the format example.`
  },

  'arch_adjust': {
    system: `You are a Architect, named Bob, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple enough and use  appropriate open source libraries. Use same language as user requirement.`,
    user: `
          基于已有的内容: {adjust_content} 
          根据以下的输入的内容进行优化:{user_input}

          ## context
          {user_input}


          ## format example
          [CONTENT]
          {
              "Implementation approach": "We will ...",
              "File list": [
                  "main.py",
                  "game.py"
              ],
              "Data structures and interfaces": "\nclassDiagram\n    class Main {\n        -SearchEngine search_engine\n        +main() str\n    }\n    class SearchEngine {\n        -Index index\n        -Ranking ranking\n        -Summary summary\n        +search(query: str) str\n    }\n    class Index {\n        -KnowledgeBase knowledge_base\n        +create_index(data: dict)\n        +query_index(query: str) list\n    }\n    class Ranking {\n        +rank_results(results: list) list\n    }\n    class Summary {\n        +summarize_results(results: list) str\n    }\n    class KnowledgeBase {\n        +update(data: dict)\n        +fetch_data(query: str) dict\n    }\n    Main --> SearchEngine\n    SearchEngine --> Index\n    SearchEngine --> Ranking\n    SearchEngine --> Summary\n    Index --> KnowledgeBase\n",
              "Program call flow": "\nsequenceDiagram\n    participant M as Main\n    participant SE as SearchEngine\n    participant I as Index\n    participant R as Ranking\n    participant S as Summary\n    participant KB as KnowledgeBase\n    M->>SE: search(query)\n    SE->>I: query_index(query)\n    I->>KB: fetch_data(query)\n    KB-->>I: return data\n    I-->>SE: return results\n    SE->>R: rank_results(results)\n    R-->>SE: return ranked_results\n    SE->>S: summarize_results(ranked_results)\n    S-->>SE: return summary\n    SE-->>M: return summary\n",
              "Anything UNCLEAR": "Clarification needed on third-party API integration, ..."
          }
          [/CONTENT]

          ## nodes: "<node>: <type>  # <instruction>"
          - Implementation approach: <class 'str'>  # Analyze the difficult points of the requirements, select the appropriate open-source framework
          - File list: typing.List[str]  # Only need relative paths. ALWAYS write a main.py or app.py here
          - Data structures and interfaces: typing.Optional[str]  # Use mermaid classDiagram code syntax, including classes, method(__init__ etc.) and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes, and comply with PEP8 standards. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
          - Program call flow: typing.Optional[str]  # Use sequenceDiagram code syntax, COMPLETE and VERY DETAILED, using CLASSES AND API DEFINED ABOVE accurately, covering the CRUD AND INIT of each object, SYNTAX MUST BE CORRECT.
          - Anything UNCLEAR: <class 'str'>  # Mention unclear project aspects, then try to clarify it.


          ## constraint
          Language: Please use the same language as Human INPUT.
          Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

          ## action
          Follow instructions of nodes, generate output and make sure it follows the format example.
          `
  },

  //项目经理确认提示词
  'proj_confirm': {
    system: `You are a Engineer, named Alex, your goal is write elegant, readable, extensible, efficient code. the constraint is the code should conform to standards like google-style and be modular and maintainable. Use same language as user requirement.`,
    user: `NOTICE
      Role: You are a professional engineer; the main goal is to write google-style, elegant, modular, easy to read and maintain code
      Language: Please use the same language as the user requirement, but the title and code should be still in English. For example, if the user speaks Chinese, the specific text of your answer should also be in Chinese.
      ATTENTION: Use '##' to SPLIT SECTIONS, not '#'. Output format carefully referenced "Format example".

      # Context
      ## Design
      {design_doc}

      ## Task
      {user_input}

      ## Original_code
      基于原来的代码，在此基础上修改，增加，删除，原来代码实现如下:
      {original_code}

      ## Legacy Code
      ${'```'}Code

      ${'```'}

      ## Debug logs
      ${'```'}text



      ${'```'}

      ## Bug Feedback logs
      ${'```'}text

      ${'```'}

      # Format example
      ## Code: certificate-management-system/src/main/java/com/example/certificate/model/Domain.java
      ${'```'}java
      ## certificate-management-system/src/main/java/com/example/certificate/model/Domain.java
      ...
      ${'```'}

      # Instruction: Based on the context, follow "Format example", write code.

      ## Code: certificate-management-system/src/main/java/com/example/certificate/model/Domain.java. Write code with triple quoto, based on the following attentions and context.
      1.Implement the code for all files listed in the tasklist, without omitting any files. The code for each file should be enclosed in 3 reverse quotes, for example
        ${'```'}java
        ${'```'}.
      2. COMPLETE CODE: Your code will be part of the entire project, so please implement complete, reliable, reusable code snippets.
      3. Set default value: If there is any setting, ALWAYS SET A DEFAULT VALUE, ALWAYS USE STRONG TYPE AND EXPLICIT VARIABLE. AVOID circular import.
      4. Follow design: YOU MUST FOLLOW "Data structures and interfaces". DONT CHANGE ANY DESIGN. Do not use public member functions that do not exist in your design.
      5. CAREFULLY CHECK THAT YOU DONT MISS ANY NECESSARY CLASS/FUNCTION IN THIS FILE.
      6. Before using a external variable/module, make sure you import it first.
      7. Write out EVERY CODE DETAIL, DON'T LEAVE TODO.`
  },
  'proj_edit': {
    system: `You are a Engineer, named Alex, your goal is write elegant, readable, extensible, efficient code. the constraint is the code should conform to standards like google-style and be modular and maintainable. Use same language as user requirement.`,
    user: `NOTICE
      Role: You are a professional engineer; the main goal is to write google-style, elegant, modular, easy to read and maintain code
      Language: Please use the same language as the user requirement, but the title and code should be still in English. For example, if the user speaks Chinese, the specific text of your answer should also be in Chinese.
      ATTENTION: Use '##' to SPLIT SECTIONS, not '#'. Output format carefully referenced "Format example".

      # Context
      ## Design
      {design_doc}

      ## Task
      {user_input}

      ## Legacy Code
      ${'```'}Code

      ${'```'}

      ## Debug logs
      ${'```'}text



      ${'```'}

      ## Bug Feedback logs
      ${'```'}text

      ${'```'}

      # Format example
      ## Code: certificate-management-system/src/main/java/com/example/certificate/model/Domain.java
      ${'```'}java
      ## certificate-management-system/src/main/java/com/example/certificate/model/Domain.java
      ...
      ${'```'}

      # Instruction: Based on the context, follow "Format example", write code.

      ## Code: certificate-management-system/src/main/java/com/example/certificate/model/Domain.java. Write code with triple quoto, based on the following attentions and context.
      1. Only One file: do your best to implement THIS ONLY ONE FILE.
      2. COMPLETE CODE: Your code will be part of the entire project, so please implement complete, reliable, reusable code snippets.
      3. Set default value: If there is any setting, ALWAYS SET A DEFAULT VALUE, ALWAYS USE STRONG TYPE AND EXPLICIT VARIABLE. AVOID circular import.
      4. Follow design: YOU MUST FOLLOW "Data structures and interfaces". DONT CHANGE ANY DESIGN. Do not use public member functions that do not exist in your design.
      5. CAREFULLY CHECK THAT YOU DONT MISS ANY NECESSARY CLASS/FUNCTION IN THIS FILE.
      6. Before using a external variable/module, make sure you import it first.
      7. Write out EVERY CODE DETAIL, DON'T LEAVE TODO.`
  },
  'proj_adjust': {
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use same language as user requirement.`,
    user: `
          基于已有的内容: {adjust_content} 
          根据以下的输入的内容进行优化:{user_input}
    
        ## context
        {user_input}

        -----

        ## format example
        [CONTENT]
        {
            "Required packages": [
                "flask==1.1.2",
                "bcrypt==3.2.0"
            ],
            "Required Other language third-party packages": [
                "No third-party dependencies required"
            ],
            "Logic Analysis": [
                [
                    "game.py",
                    "Contains Game class and ... functions"
                ],
                [
                    "main.py",
                    "Contains main function, from game import Game"
                ]
            ],
            "Task list": [
                "game.py",
                "main.py"
            ],
            "Full API spec": "openapi: 3.0.0 ...",
            "Shared Knowledge": "game.py contains functions shared across the project.",
            "Anything UNCLEAR": "Clarification needed on how to start and initialize third-party libraries."
        }
        [/CONTENT]

        ## nodes: "<node>: <type>  # <instruction>"
        - Required packages: typing.Optional[typing.List[str]]  # Provide required third-party packages in requirements.txt format.   
        - Required Other language third-party packages: typing.List[str]  # List down the required packages for languages other than Python.
        - Logic Analysis: typing.List[typing.List[str]]  # Provide a list of files with the classes/methods/functions to be implemented, including dependency analysis and imports.
        - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.
        - Full API spec: <class 'str'>  # Describe all APIs using OpenAPI 3.0 spec that may be used by both frontend and backend. If front-end and back-end communication is not required, leave it blank.
        - Shared Knowledge: <class 'str'>  # Detail any shared knowledge, like common utility functions or configuration variables.   
        - Anything UNCLEAR: <class 'str'>  # Mention any unclear aspects in the project management context and try to clarify them.   


        ## constraint
        Language: Please use the same language as Human INPUT.
        Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

        ## action
        Follow instructions of nodes, generate output and make sure it follows the format example.`
  },

  'dev_confirm': {
    system: `You are a System Architect designing technical solutions.`,
    user: `Design system architecture for:\n{user_input}\n\nOutput format:\n[CONTENT]{\n  "Components": [],\n  "Data Flow": ""\n}[/CONTENT]`
  },
  'dev_edit': {
    system: `You are a System Architect designing technical solutions.`,
    user: `Design system architecture for:\n{user_input}\n\nOutput format:\n[CONTENT]{\n  "Components": [],\n  "Data Flow": ""\n}[/CONTENT]`
  },
  'dev_adjust': {
    system: `You are a System Architect designing technical solutions.`,
    user: `Design system architecture for:\n{user_input}\n\nOutput format:\n[CONTENT]{\n  "Components": [],\n  "Data Flow": ""\n}[/CONTENT]`
  }
};

export function getIncrementalPrompt(role: Role, action: ActionType): PromptParts {
  const key = `${role}_${action}`;
  console.log("===== key===",key)
  
  if (!PROMPT_TEMPLATES[key]) {
    throw new Error(`No template found for ${key}`);
  }

  // 返回模板的深拷贝
  return JSON.parse(JSON.stringify(PROMPT_TEMPLATES[key]));
}