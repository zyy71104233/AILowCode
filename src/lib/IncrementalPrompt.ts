import { Role, ActionType } from '../types/types';

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
        基于原需求文档:
        {original_doc} 
        
        新增以下需求：
        {user_input}

        要求：
        1.回答的内容中不要包含原需求文档的内容，只包含本次迭代新增需求
        2.保留原文档结构，用红色标注变更内容

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
            "Anything UNCLEAR": "",
            "Changed Content": "1.新增功能xxxx 2.修改原有功能xxxx"
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
        - Changed Content: <class 'str'>  # 和原需求文档相比，新增或修改的内容，没有变化的内容不要写


        ## constraint
        Language: Please use the same language as Human INPUT.
        Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

        ## action
        Follow instructions of nodes, generate output and make sure it follows the format example.

        `
  },

  // 产品经理确认提示词
  'pd_confirm': {
    system: `You are a Architect, named Bob, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple enough and use  appropriate open source libraries. Use same language as user requirement.`,
    user: `
        基于现有系统设计文档:
        {original_doc}
        
        新需求输入​
        {user_input}

          ## format example
          [CONTENT]
          {
            "Implementation approach": "We will ...",

            "File list": [
                "<模块路径>  #标注修改类型",
                "core/feature_detector.py[新增]",
                "api/router.py[修改]"
                "package.json [新增]"
                "pom.xml [新增]"
            ],

            "Flow chart Diagram":"
            flowchart LR
                subgraph 初始化
                    A[启动程序] --> B[加载配置]
                    B --> C{配置有效?}
                end

                C -- 有效 --> D[连接数据库]
                C -- 无效 --> E[退出程序]

                subgraph 主流程
                    D --> F[执行查询]
                    F --> G[显示结果]
                end
            ",

            "Full API spec": "
            openapi: 3.0.0 ...
                paths:
                    /api/v3/users:
                        get:
                        description: "支持分页查询"",

            "Data structures and interfaces": "
                classDiagram
                    class ExistingClass  [修改
                    ] {
                        + existing_method()
                        + updated_method() str [新增]
                    }
                    
                    class NewFeature {
                        + preprocess() bool
                        + analyze() Dict[str, float]
                    }

                    class originalFeature [修改] {
                        +String name [新增]
                        +String printName() void
                    }
                    
                    ExistingClass --> NewFeature  # 用箭头标注新依赖关系",
                    NewFeature --> originalFeature

            "Program call flow": "
                sequenceDiagram
                    participant A as ExistingComponent
                    participant B as NewService
                    
                    A->>B: initialize_config()
                    A->>B: async fetch_data()
                    B-->>A: callback(response)",

            "Database operation": {
                "DDL Changes": [
                    "ALTER TABLE users ADD COLUMN last_login TIMESTAMP [修改]",
                    "CREATE TABLE behavior_logs (appid VARCHAR(32) PRIMARY KEY, name VARCHAR(64) NOT NULL) [新增] # 包含索引设计"
                ],
                "Data Flow": "[ETL方案] 需处理历史数据迁移"
            },

            "Impact":"前端:xxxx, 
            后端:xxxx, 
            DB影响:xxx,
            API影响:xxxx"

              "Anything UNCLEAR": "Clarification needed on third-party API integration, ..."
          }
          [/CONTENT]

          ## nodes: "<node>: <type>  # <instruction>"
          - Implementation approach: <class 'str'>  # Analyze the difficult points of the requirements, select the appropriate open-source framework.
          例如
          前端技术栈:React,javascript,ts,tsx等
          后端技术栈:java,springboot,数据库mysql,mybatis等。不要用JPA,Hibernate。

          - File list: typing.List[str]  # Only need relative paths. ALWAYS write a main.py or app.py here.新增/修改/删除文件,配置文件(pom.xml,package.json),sql文件。

          - Flow chart Diagram: # Use mermaid Flow chart Diagram code syntax, according to "Requirement Pool" in context, implemnt all stories.

          - Full API spec:  # Describe all APIs using OpenAPI 3.0 spec that may be used by both frontend and backend. If front-end and back-end communication is not required, leave it blank.

          - Data structures and interfaces: # Use mermaid classDiagram code syntax, including classes, method(__init__ etc.) and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes, and comply with PEP8 standards. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
          1.只能关联已定义的类,不能关联不存在的类,如有如下关联
          ApplicationController --> ApplicationService,则ApplicationController,ApplicationService都必须存在定义
          class ApplicationController {},class ApplicationService {}
          2.本次没有修改的类,如果需要关联,也要展现,包括方法,变量,要完整显示,如 class originalFeature {
                        +String name
                        +String printName() void
                    }
            3.如果已存在类有变化,指出修改的地方,如新增变量,方法
                class ExistingClass {
                            + existing_method()
                            + updated_method() str [新增]
                        }

                class originalFeature {
                    +String name [新增]
                    +String printName() void
                }


          - Program call flow: typing.Optional[str]  # Use sequenceDiagram code syntax, COMPLETE and VERY DETAILED, using CLASSES AND API DEFINED ABOVE accurately, covering the CRUD AND INIT of each object, SYNTAX MUST BE CORRECT.
          1.调用方法名来自"Data structures and interfaces"中定义的,如getAllDomains() 
          2.用note over标注交互步骤,如：
          sequenceDiagram
            participant A as 用户
            participant B as 系统
            note over A,B: 交互步骤
            activate A
            A ->> B: existing_method
            deactivate A
            B ->> A: 新增响应


          - Database operation:typing.List[str] # 所有用到的DDL,包括[修改]/[新增]/[数据迁移]

          

          - Impact:  #所有变更需注明影响范围(前端/后端/DB/API)

          - Anything UNCLEAR: <class 'str'>  # Mention unclear project aspects, then try to clarify it.


          ## constraint
          Language: Please use the same language as Human INPUT.
          Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

          ## action
          Follow instructions of nodes, generate output and make sure it follows the format example.
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
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use Chinese language.`,
    user: `## context
      {user_input}

      ## format example
        [CONTENT]
        {
            "Logic Analysis": [
                [
                    "game.py",
                    "包括 Game 类 and ... 方法"
                ],
                [
                    "main.py",
                    "包括 main function, from game import Game"
                ]
            ],
            "Task list": [
              "[新增]game.py",
              "[修改]main.py"
            ],
            "Shared Knowledge": "game.py contains functions shared across the project.",
            "Anything UNCLEAR": "Clarification needed on how to start and initialize third-party libraries."
        }
        [/CONTENT]

        ## nodes: "<node>: <type>  # <instruction>"

        - Logic Analysis: typing.List[typing.List[str]]  # Provide a list of files with the classes/methods/functions to be implemented, including dependency analysis and imports.
        - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.参考file list,如果有前后端需求,要包括配置文件,如package.json,pom.xml,sql.
        标注[新增]/[修改]文件


        - Shared Knowledge: <class 'str'>  # Detail any shared knowledge, like common utility functions or configuration variables.   
        - Anything UNCLEAR: <class 'str'>  # Mention any unclear aspects in the project management context and try to clarify them.   


        ## constraint
        Language: Please use the same language as Human INPUT.
        Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

        ## action
        Follow instructions of nodes, generate output and make sure it follows the format example.`
  },

  // 架构师编辑提示词 (与确认相同)
  'arch_edit': {
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use same language as user requirement.`,
    user: `## context
      {user_input}

         ## format example
        [CONTENT]
        {
            "Logic Analysis": [
                [
                    "game.py",
                    "包括 Game 类 and ... 方法"
                ],
                [
                    "main.py",
                    "包括 main function, from game import Game"
                ]
            ],
            "Task list": [
              "[新增]game.py",
              "[修改]main.py"
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
        - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.参考file list,如果有前后端需求,要包括配置文件,如package.json,pom.xml,sql.
        标注[新增]/[修改]文件

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
         ## context
          
          ## existing design document
          {adjust_content}
          
          ## user input instructions
          {user_input}

          ## format example
          [CONTENT]
          {
            "Implementation approach": "We will ...",
            "File list": [
                "<模块路径>  #标注修改类型",
                "core/feature_detector.py[新增]",
                "api/router.py[修改]",
		"package.json[修改]"
                "pom.xml[修改]"
            ],

"Flow chart Diagram":"
            flowchart LR
                subgraph 初始化
                    A[启动程序] --> B[加载配置]
                    B --> C{配置有效?}
                end

                C -- 有效 --> D[连接数据库]
                C -- 无效 --> E[退出程序]

                subgraph 主流程
                    D --> F[执行查询]
                    F --> G[显示结果]
                end
            ",

"Full API spec": "
            openapi: 3.0.0 ...
                paths:
                    /api/v3/users:
                        get:
                        description: "支持分页查询"",

            "Data structures and interfaces": "
                classDiagram
                    class ExistingClass {
                        + existing_method()
                        + updated_method() str [新增]
                    }
                    
                    class NewFeature {
                        + preprocess() bool
                        + analyze() Dict[str, float]
                    }

                    class originalFeature {
                        +String name[新增]
                        +String printName() void
                    }
                    
                    ExistingClass --> NewFeature  # 用箭头标注新依赖关系",
                    NewFeature --> originalFeature

            "Program call flow": "
                sequenceDiagram
                    participant A as ExistingComponent
                    participant B as NewService
                    
                    A->>B: initialize_config()
                    A->>B: async fetch_data()
                    B-->>A: callback(response)",

            "Database operation": {
                "DDL Changes": [
                    "ALTER TABLE users ADD COLUMN last_login TIMESTAMP [修改]",
                    "CREATE TABLE behavior_logs (...)  [新增] # 包含索引设计"
                ],
                "Data Flow": "[ETL方案] 需处理历史数据迁移"
            },

            "Impact":"前端:xxxx, 
            后端:xxxx, 
            DB影响:xxx,
            API影响:xxxx"

              "Anything UNCLEAR": "Clarification needed on third-party API integration, ..."
          }
          [/CONTENT]

          ## nodes: "<node>: <type>  # <instruction>"
          - Implementation approach: <class 'str'>  # Analyze the difficult points of the requirements, select the appropriate open-source framework.
          例如
          前端技术栈:React,javascript,ts,tsx等
          后端技术栈:java,springboot,数据库mysql,mybatis等。不要用JPA,Hibernate。

          - File list: typing.List[str]  # Only need relative paths. ALWAYS write a main.py or app.py here.新增/修改/删除文件,配置文件(pom.xml,package.json),sql文件。

        - Flow chart Diagram: # Use mermaid Flow chart Diagram code syntax.

        - Full API spec: <class 'str'>  # Describe all APIs using OpenAPI 3.0 spec that may be used by both frontend and backend. If front-end and back-end communication is not required, leave it blank.

          - Data structures and interfaces: typing.Optional[str]  # Use mermaid classDiagram code syntax, including classes, method(__init__ etc.) and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes, and comply with PEP8 standards. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
          1.只能关联已定义的类,不能关联不存在的类,如有如下关联
          ApplicationController --> ApplicationService,则ApplicationController,ApplicationService都必须存在定义
          class ApplicationController {},class ApplicationService {}
          2.本次没有修改的类,如果需要关联,也要展现,包括方法,变量,要完整显示,如 class originalFeature {
                        +String name
                        +String printName() void
                    }
            3.如果已存在类有变化,指出修改的地方,如新增变量,方法
                class ExistingClass {
                            + existing_method()
                            + updated_method() str [新增]
                        }

                class originalFeature {
                    +String name [新增]
                    +String printName() void
                }

          - Program call flow: typing.Optional[str]  # Use sequenceDiagram code syntax, COMPLETE and VERY DETAILED, using CLASSES AND API DEFINED ABOVE accurately, covering the CRUD AND INIT of each object, SYNTAX MUST BE CORRECT.
          1.调用方法名来自"Data structures and interfaces"中定义的,如getAllDomains() 
          2.用note over标注交互步骤,如：
          sequenceDiagram
            participant A as 用户
            participant B as 系统
            note over A,B: 交互步骤
            activate A
            A ->> B: existing_method
            deactivate A
            B ->> A: 新增响应


          - Database operation:typing.List[str] #  所有用到的DDL,包括[修改]/[新增]/[数据迁移]

          - Impact: <class 'str'>  #所有变更需注明影响范围(前端/后端/DB/API)

          - Anything UNCLEAR: <class 'str'>  # Mention unclear project aspects, then try to clarify it.


          ## constraint
          Language: Please use the same language as Human INPUT.
          Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

          ## action
          Follow instructions of nodes,based on existing design document, optimize and generate new design document according to user input instructions and make sure it follows the format example.
            For each instruction node, it is necessary to comply with the user input and only modify the areas that need to be changed. Existing unmodified areas should be retained and not deleted. For example, if there are already 2 time series in the sequence diagram but 3 are missing, 3 should be added on the original basis, making a total of 5.
          `
  },

  //项目经理确认提示词
  'proj_confirm': {
    system: `You are a Engineer, named Alex, your goal is write elegant, readable, extensible, efficient code. the constraint is the code should conform to standards like google-style and be modular and maintainable. Use Chinese language.`,
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
        1.Implement the following code without omitting any files. 
            1.1 All files in the Task list must be implemented strictly in accordance with the analysis requirements
            1.2 For the modified parts of the existing files, it is required to provide the complete modified code
            1.3 Package.json for frontend, pom.xml for backend, mapper.xml file, SQL file.
        The code for each file should be enclosed in 3 reverse quotes, for example
            ${'```'}java
            ${'```'}.

    2.use tech stack.Generate code according to the following Technical Stack,strictly follow component version
            "Technical Stack Specification": {
                    "Frontend": {
                        "Core": [
                            "react@18.2.0",
                            "react-dom@18.2.0",
                            "typescript@5.3.3",
                            "@types/react@18.2.45",
                            "@types/react-dom@18.2.18"
                        ],
                        "State Management": [
                            "redux@4.2.1",
                            "@reduxjs/toolkit@1.9.7",
                            "react-redux@8.1.3"
                        ],
                        "Routing": "react-router-dom@6.20.1",
                        "UI Library": "antd@5.12.5",
                        "HTTP Client": "axios@1.6.2",
                        "Build Tools": [
                            "vite@5.0.8",
                            "@vitejs/plugin-react@4.2.1"
                        ],
                        "Linting": [
                            "eslint@8.55.0",
                            "typescript-eslint@6.13.0"
                        ],
                        "Testing": [
                            "jest@29.7.0",
                            "@testing-library/react@14.0.0"
                        ]
                    },
                    "Backend": {
                        "Runtime": "OpenJDK 17.0.8",
                        "Framework": [
                            "spring-boot-starter-parent@3.2.0",
                            "spring-boot-starter-web@3.2.0"
                        ],
                        "Persistence": [
                            "mybatis-spring-boot-starter@3.0.3",
                            "mybatis@3.5.13",
                            "mybatis-spring@3.0.3"
                        ]
                        "Build Tools": "maven-compiler-plugin@3.11.0"
                    }
            - Package manifest must contain exact versions (NO ^/~)

 
                3. Follow design: YOU MUST FOLLOW "Data structures and interfaces" and "Program call flow". DONT CHANGE ANY DESIGN. Do not use public member functions that do not exist in your design.
        The frontEnd calling interface must be generated using the "Full API spec", and the backEnd calling must use the methods provided in the class diagram

        4.Code integrity verification
        4.1 Do not use non-existent components, methods, or variables in the front-end and back-end code. For example, in class A, use class b=new B();  b.methodB, Both Type B and Method B must have been implemented.
        4.2 The necessary fields of db must have a place to assign values, either through front-end or back-end settings.
        4.3 All front-end implemented function points must have page entrances.


      5. COMPLETE CODE: Your code will be part of the entire project, so please implement complete, reliable, reusable code snippets.

      6. Set default value: If there is any setting, ALWAYS SET A DEFAULT VALUE, ALWAYS USE STRONG TYPE AND EXPLICIT VARIABLE. AVOID circular import.
 
      7. CAREFULLY CHECK THAT YOU DONT MISS ANY NECESSARY CLASS/FUNCTION IN THIS FILE.
      8. Before using a external variable/module, make sure you import it first.
      9. Write out EVERY CODE DETAIL, DON'T LEAVE TODO.`
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
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use Chinese language.`,
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
                    "包括 Game 类 and ... 方法"
                ],
                [
                    "main.py",
                    "包括 main function, from game import Game"
                ]
            ],
            "Task list": [
              "[新增]game.py",
              "[修改]main.py"
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
        - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.参考file list,如果有前后端需求,要包括配置文件,如package.json,pom.xml,sql.
        标注[新增]/[修改]文件

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