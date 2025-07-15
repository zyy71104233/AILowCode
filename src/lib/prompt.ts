type Role = 'user' | 'pd' | 'arch' |  'proj'|'dev';
export type ActionType = 'confirm' | 'edit' | 'adjust'| 'generateDoc';

interface PromptParts {
  system: string;
  user: string;
}

// 改为直接内联提示词模板
const PROMPT_TEMPLATES: Record<string, PromptParts> = {
  // 用户需求提示词
  'user_confirm': {
    system: `You are a Product Manager, your goal is efficiently create a successful product that meets market demands.`,
    user: `## context

    ### Original Requirements
        {user_input}

        ## format example
        [CONTENT]
        {
            "Programming Language": "java,javascript,react",
            "Original Requirements": "创建 a 2048 game",
            "Project Name": "游戏_2048",
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
            "UI Design draft": "[
                    "页面：xx",
                    "用到接口：xxx",
                    "功能说明：xxx",
                    "UI说明：xxx",
                    "===========",
                    "页面：xx",
                    "用到接口：xxx",
                    "功能说明：xxx",
                    "UI说明：xxx",
            ]",
            "Anything UNCLEAR": ""
        }
        [/CONTENT]

        ## nodes: "<node>: <type>  # <instruction>"
        - Language: <class 'str'>  # Provide the language used in the project, typically matching the user's requirement language.    
        - Programming Language: <class 'str'>  # react/javascript for frontend,java for backend.
        - Original Requirements: <class 'str'>  # Place the original user's requirements here.
        - Project Name: <class 'str'>  # According to the content of "Original Requirements," name the project using snake case style , like 'game_2048' or 'simple_crm.
        - Product Goals: typing.List[str]  # Provide up to three clear, orthogonal product goals.
        - User Stories: typing.List[str]  # Provide up to to 7 scenario-based user stories.
        - Requirement Analysis: <class 'str'>  # Provide a detailed analysis of the requirements.
        - Requirement Pool: typing.List[typing.List[str]]  # List down the top-7 requirements with their priority (P0, P1, P2). 

        - UI Design draft: <class 'str'>  # 根据requirement pool,站在页面维度描述所有UI功能.格式如下：
            页面：xx
            用到接口：xxx
            功能说明：xxx
            UI说明：xxx


        - Anything UNCLEAR: <class 'str'>  # Mention any aspects of the project that are unclear and try to clarify them.


        ## constraint
        Language: Please use Chinese language.
        Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

        ## action
        Follow instructions of nodes, generate output and make sure it follows the format example.

        `
  },

  // 产品经理确认提示词
  'pd_confirm': {
    system: `You are a Architect, named Bob, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple and complete enough, DO NOT MISS ANY Requirement. Use Chinese language.`,
    user: `## context
          {user_input}

          ## format example
          [CONTENT]
          {
            "Implementation approach": "We will ...",
            "File list": [
                "core/feature_detector.py",
                "api/router.py",
                "package.json",
                "pom.xml",
                "Application.java",
                "MyBatisConfig.java"
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

            "Data structures and interfaces": "
                classDiagram
                    class ExistingClass {
                        + existing_method()
                        + updated_method() str
                    }
                    
                    class NewFeature {
                        + preprocess() bool
                        + analyze() Dict[str, float]
                    }
                    ExistingClass --> NewFeature  # 用箭头标注新依赖关系",

            "Program call flow": "
                sequenceDiagram
                    participant A as ExistingComponent
                    participant B as NewService
                    
                    A->>B: initialize_config()
                    A->>B: async fetch_data()
                    B-->>A: callback(response)",

            "Database operation": {
                "DDL Changes": [
                    "ALTER TABLE users ADD COLUMN last_login TIMESTAMP",
                    "CREATE TABLE behavior_logs (appid VARCHAR(32) PRIMARY KEY, name VARCHAR(64) NOT NULL)  # 包含索引设计"
                ],
                "Data Flow": "[ETL方案] 需处理历史数据迁移"
            },
            "frontEnd clientApi":"
                classDiagram
                        class certificateApi {
                            + getCertificate()
                            + addCertificate() str
                        }
            ",
            "frontEnd flow chart":"
                sequenceDiagram
                        participant A as DomainList.tsx
                        participant B as CertificateDetail.tsx
                        A->>A: getAllDomains()
                        A->>B: getCertificateDetail()
                        B-->>B: callback(response)
            ","Total File list": [
                "core/feature_detector.py",
                "api/router.py",
                "package.json",
                "pom.xml",
                "Application.java",
                "MyBatisConfig.java"
            ],

              "Anything UNCLEAR": "Clarification needed on third-party API integration, ...",
              "checklist":"检查设计文档是否有错误, 不详细模糊的地方"
          }
          [/CONTENT]

          ## nodes: "  # <instruction>"
          - Implementation approach: # Analyze all points of the requirements.use tech stack as below.
          {
            "Frontend": {
                "Core": [
                    "react",
                    "typescript",
                ],
                "UI Library": "antd",
            },
            "Backend": {
                "Framework": [
                    "spring-boot-starter-parent",
                    "spring-boot-starter-web"
                ],
                "Persistence": [
                    "mybatis",
                ],"Database": [
                    "MySQL",
                ]
            }

          - File list:  # 生成所有代码文件,包括前端入口文件(app.tsx,并注册所有router信息),前端配置文件(package.json),后端java程序入口文件(Application.java),后端配置文件(pom.xml,MyBatisConfig.java),sql文件。
          生成前端页面时,参考UI Design draft中所列出的页面
          Only need relative paths.只包括文件,不要写其他东西

          - Flow chart Diagram: # Use mermaid Flow chart Diagram code syntax, according to "Requirement Pool" in context, implemnt all stories.

          - Data structures and interfaces: # follow "Flow chart Diagram" above, use mermaid classDiagram code syntax, including classes, method and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
          1.根据"User Stories","Requirement Pool","UI Design draft",完成类图设计,不要遗漏任何一个用例
          2.只能关联已定义的类,不能关联不存在的类,如有如下关联
          ApplicationController --> ApplicationService,则ApplicationController,ApplicationService都必须存在定义
          class ApplicationController {},class ApplicationService {}
          3.适当定义VO、DTO、DO 和 PO。

          - Program call flow: # Fully implement the sequence diagram of the requirements in the requirements pool, and use the methods in the class diagram and APIs, without missing any requirements, SYNTAX MUST BE CORRECT.
          According to the requirements, ensure that the sequenceDiagram are clear, complete, and without omissions
          时序图必须遵循以下几点要求
          1.调用方法名来自"Data structures and interfaces"中定义的,如getAllDomains() 
          2.后端参与者必须细节到类, 不能用后端替代, 参数要标注类型,如id:String,返回值也必须有具体类型。前端参与者可以用前端页面统一替代, 不要详细到每个前端页面名称。
          3.如果有前端调用,必须标注http的method,request url。method只允许GET,POST
          4.如果后端用到数据库,则要将数据库作为参与者,并且描述操作的sql语句。
          5.用note over标注每个交互步骤,不要将多个流程放用同一个note over.
          6.所有时序步骤在同一个sequenceDiagram下,不要有多个sequenceDiagram开头
          例子如下：
          sequenceDiagram
                participant UI as 前端界面
                participant C1 as Controller1
                participant S1 as Service1
                participant DB as 数据库

                note over UI,DB: 查询所有订单列表
                UI ->> C1: /api/orders/getAllOrders
                C1 ->> S1:getAllOrders()
                S1 ->> DB:SELECT * FROM ORDERS
                DB -->>S1: List ~order~
                S1 -->>C1: List ~order~
                C1 -->> UI: List ~order~

                note over UI,DB: 查询订单详情
                UI ->> C1: /api/orders/getDetail/orderId
                C1 ->> S1:getDetailOrder(orderId:String)
                S1 ->> DB:SELECT * FROM ORDER by orderId
                DB -->>S1: order
                S1 -->>C1: order
                C1 -->> UI: order

          - Database operation: # 所有用到的DDL,包括创建数据库

          - frontEnd clientApi: #Front end class diagram, including but not limited to entity classes and all types and interfaces that interact with the backend. The Mermaid classDiagram code syntax, including classes, methods, parameters, and return values, is very detailed and complete.


          - frontEnd flow chart: #Refine the page flowchart to tsx files or classes, determine which method each page calls, and the method must be derived from the frontEnd clientApi class diagram, Use mermaid sequence diagram code syntax.
          1.前端参与者细化到所有前端页面文件，类，接口，组件。后端不需要细化，可用后端代替。
          2.调用的方法必须来自frontEnd clientApi的类图,参数要标注类型,返回值也必须有具体类型
          3.页面间跳转要标注 动作和路由信息
          4.前端调用后端接口时,要标注method,request url。method必须是GET,POST。
          5.用note over标注每个交互步骤,不要将多个流程放用同一个note over.
          6.所有时序步骤在同一个sequenceDiagram下,不要有多个sequenceDiagram开头
          例子如下：
          sequenceDiagram 
                participant DL as DomainList.tsx 
                participant CL as CertificateList.tsx 
                participant CD as CertificateDetail.tsx 
                participant CA as certificateApi 
                participant BK as 后端 

                note over DL,CA: 查看域名关联证书列表  
                DL ->> CL: 点击域名行 (路由: /domains/:id/certificates)
                CL ->> CA: getCertificatesByDomain(domainId: string) 
                CA ->> BK: GET /certificate/getbydomain/domainId
                BK -->> CA:List~Certificate~
                CA -->> CL: List~Certificate~ 

                note over CL,CA: 查看证书详情 
                CL ->> CD: 点击证书行 (路由: /certificates/:id) 
                CD ->> CA: getCertificateDetail(id: string) 
                CA ->> BK: GET /certificate/getDetail/domainId
                BK -->> CA:Certificate
                CA -->> CD: Certificate

          - Total File list:首先, 必须实现"Data structures and interfaces",  "frontEnd clientApi"中定义的类, 不能遗漏。每个类由一个文件实现,不要一个文件实现全部类,例如有class A,class B,则A.java/tsx实现class A, B.java/tsx实现class B,文件名是类名。
          其次, 参考"Program call flow", "frontEnd flow chart"的内容, 检查File list是否有遗漏的文件, 如有将补充的文件和原来File list合并后一起展示, 仅补充必要的核心文件, 不要新增不重要的文件, 例如异常处理, 布局等非核心文件。
          Only need relative paths.只包括文件,不要写其他东西

          - Anything UNCLEAR:  # Mention unclear project aspects, then try to clarify it.
          - checklist: 检查设计文档问题
          1.将Requirement Pool和相关类图关联，如"需求1(P0) ---- class A, class B"，检查是否有遗漏生成的类图
          2.时序图(Program call flow)中参与者是否精确到类，是否齐全？
          3.时序图(Program call flow)中是否涵盖所有需求和用例？
          4.时序图(Program call flow)方法是否都来自类图(Data structures and interfaces)，参数和返回值是否约定清楚？
          5.时序图(Program call flow)中每个时序逻辑是否正确？调用逻辑是否一致，例如是否有下层方法返回int，但上层返回object类型？
            2.类图(Data structures and interfaces) 中是否有方法未在Program call flow使用？如果有, 请指出是哪些类？
            3.检查页面流程图(frontEnd flow chart)中方法是否都来自前端Api类图(frontEnd clientApi)？
            4.前端Api类图(frontEnd clientApi)中是否有方法未在frontEnd flow chart使用？如果有, 请指出是哪些类？
            5.total file list中是否实现了Data structures and interfaces, frontEnd clientApi中所有类？
            6.页面流程图(frontEnd flow chart)中是否有重复的request url, 包括url, method都相同


          ## constraint
          Language: Please use the same language as Human INPUT.
          Format: output wrapped inside [CONTENT][/CONTENT] like format example, nothing else.

          ## action
          Follow instructions of nodes, generate output and make sure it follows the format example.
          `
  },

  // 产品经理编辑提示词 (与确认相同)
  'pd_edit': {
    system: `You are a Architect, named Bob, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple enough and use  appropriate open source libraries. Use Chinese language.`,
    user: `## context
          {user_input}


          ## format example
          [CONTENT]
          {
            "Implementation approach": "We will ...",
            "File list": [
                "<模块路径>  #标注修改类型",
                "core/[新增]feature_detector.py",
                "api/[修改]router.py"
                "[新增]package.json"
                "[新增]pom.xml"
            ],

            "Data structures and interfaces": "
                classDiagram
                    class ExistingClass {
                        + existing_method()
                        [修改] updated_method() str
                    }
                    
                    class NewFeature {
                        + preprocess() bool
                        + analyze() Dict[str, float]
                    }

                    class originalFeature {
                        +String name
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
                    "ALTER TABLE [修改]users ADD COLUMN last_login TIMESTAMP",
                    "CREATE TABLE [新增]behavior_logs (appid VARCHAR(32) PRIMARY KEY, name VARCHAR(64) NOT NULL)  # 包含索引设计"
                ],
                "Data Flow": "[ETL方案] 需处理历史数据迁移"
            },

              "Anything UNCLEAR": "Clarification needed on third-party API integration, ..."
          }
          [/CONTENT]

          ## nodes: "<node>: <type>  # <instruction>"
          - Implementation approach: <class 'str'>  # Analyze the difficult points of the requirements, select the appropriate open-source framework,orm only use mybatis,not use jpa,hibernate.
          例如
          前端技术栈:React,javascript,ts,tsx等
          后端技术栈:java,springboot,数据库mysql,mybatis等。不要用JPA,Hibernate。

          - File list: typing.List[str]  # 生成所有代码文件,包括前端入口文件(app.tsx),前端配置文件(package.json),后端java程序入口文件(Application.java),后端配置文件(pom.xml,MyBatisConfig.java),sql文件。
          生成前端页面时,参考UI Design draft中所列出的页面
          Only need relative paths.只包括文件,不要写其他东西

          - Data structures and interfaces: typing.Optional[str]  # Use mermaid classDiagram code syntax, including classes, method(__init__ etc.) and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes, and comply with PEP8 standards. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
          根据"User Stories","Requirement Pool","UI Design draft",完成类图设计,不要遗漏任何一个用例
          1.只能关联已定义的类,不能关联不存在的类,如有如下关联
          ApplicationController --> ApplicationService,则ApplicationController,ApplicationService都必须存在定义
          class ApplicationController {},class ApplicationService {}
          2.本次没有修改的类,如果需要关联,也要展现,包括方法,变量,要完整显示,如 class originalFeature {
                        +String name
                        +String printName() void
                    }

          - Program call flow: typing.Optional[str]  # Use sequenceDiagram code syntax, COMPLETE and VERY DETAILED, using CLASSES AND API DEFINED ABOVE accurately, covering the CRUD AND INIT of each object, SYNTAX MUST BE CORRECT.
          根据context中"User Stories","Requirement Pool"完成时序图设计,不要遗漏任何一个用例
          2.如果用到数据库,要加上mapper类,DB
          3.时序图调用方法名来自"Data structures and interfaces"中定义的,如existing_method。方法后带中文注释,如getAllDomains() note right as "获取所有域名"
          4.用note over标注新增交互步骤,如：
          sequenceDiagram
            participant A as 用户
            participant B as 系统
            note over A,B: 新增交互步骤
            activate A
            A ->> B: existing_method(新增请求)
            deactivate A
            B ->> A: 新增响应


          - Database operation:typing.List[str] # 用到的DDL,包括[修改]/[新增]/[数据迁移]


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
        ## context
          
        ## existing prd document as below
          {adjust_content}
          
        ## user input instructions as below
          {user_input}

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
        - Original Requirements: <class 'str'>  # Place user input instructions here.
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

        ## action
            Follow instructions of nodes,based on existing prd document, optimize and generate new prd according to user input instructions and make sure it follows the format example.
            For each instruction node, it is necessary to comply with the user input and only modify the areas that need to be changed. Existing unmodified areas should be retained and not deleted. 
            For example, if there are already 2 requirements in the Requirement Pool but 3 are missing, 3 should be added on the original basis, making a total of 5.
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
              "game.py",
              "main.py"
            ],
            "Full API spec": "
            openapi: 3.0.0 ...
                paths:
                    /api/v3/users:
                        get:
                        description: "支持分页查询"",
            "Shared Knowledge": "game.py contains functions shared across the project.",
            "Anything UNCLEAR": "Clarification needed on how to start and initialize third-party libraries."
        }
        [/CONTENT]

        ## nodes: "<node>: <type>  # <instruction>"
        
        - Logic Analysis: typing.List[typing.List[str]]  # Provide a list of files with the classes/methods/functions to be implemented, including dependency analysis and imports. refer to task list
        - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.参考total file list,如果有前后端需求,要包括配置文件,如package.json,pom.xml,sql.

        - Full API spec:   # Describe all APIs using OpenAPI 3.0 spec that may be used by both frontend and backend. If front-end and back-end communication is not required, leave it blank.ensure that the functions are clear, complete, and without omissions

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
            
            "Full API spec": "
            openapi: 3.0.0 ...
                paths:
                    /api/v2/users:
                        get:
                        deprecated: true  # [废弃] 使用/v3版本替代
                    /api/v3/users:
                        get:
                        description: "[新增] 支持分页查询"",
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
    system: `You are a Architect, your goal is design a concise, usable, complete software system. the constraint is make sure the architecture is simple and complete enough. Use same language as user requirement.`,
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
            "core/feature_detector.py",
            "api/router.py",
            "package.json",
            "pom.xml",
            "Application.java",
            "MyBatisConfig.java"
        ],

        "Data structures and interfaces": "
            classDiagram
                class ExistingClass {
                    + existing_method()
                    + updated_method() str
                }
                
                class NewFeature {
                    + preprocess() bool
                    + analyze() Dict[str, float]
                }

                class originalFeature {
                    +String name
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
                "ALTER TABLE users ADD COLUMN last_login TIMESTAMP",
                "CREATE TABLE behavior_logs (appid VARCHAR(32) PRIMARY KEY, name VARCHAR(64) NOT NULL)  # 包含索引设计"
            ],
            "Data Flow": "[ETL方案] 需处理历史数据迁移"
        },


        "frontEnd clientApi":"
            classDiagram
                    class certificateApi {
                        + getCertificate()
                        + addCertificate() str
                    }
        ",
        "frontEnd flow chart":"
            sequenceDiagram
                    participant A as DomainList.tsx
                    participant B as CertificateDetail.tsx
                    A->>A: getAllDomains()
                    A->>B: getCertificateDetail()
                    B-->>B: callback(response)
        ","Total File list": [
            "core/feature_detector.py",
            "api/router.py",
            "package.json",
            "pom.xml",
            "Application.java",
            "MyBatisConfig.java"
        ],

            "Anything UNCLEAR": "Clarification needed on third-party API integration, ..."
        }
        [/CONTENT]

        ## nodes: " # <instruction>"
        - Implementation approach: <class 'str'>  # Analyze the difficult points of the requirements, select the appropriate open-source framework,orm only use mybatis,not use jpa,hibernate.
        例如
        前端技术栈:React,javascript,ts,tsx等
        后端技术栈:java,springboot,数据库mysql,mybatis等。不要用JPA,Hibernate。

        - File list: typing.List[str]  # # 生成所有代码文件,包括前端入口文件(app.tsx,并注册所有router信息),前端配置文件(package.json),后端java程序入口文件(Application.java),后端配置文件(pom.xml,MyBatisConfig.java),sql文件。
        Only need relative paths.只包括文件,不要写其他东西

        - Flow chart Diagram: # Use mermaid Flow chart Diagram code syntax.

        - Data structures and interfaces: typing.Optional[str]  # Use mermaid classDiagram code syntax, including classes, method(__init__ etc.) and functions with type annotations, CLEARLY MARK the RELATIONSHIPS between classes, and comply with PEP8 standards. The data structures SHOULD BE VERY DETAILED and the API should be comprehensive with a complete design.
        1.只能关联已定义的类,不能关联不存在的类,如有如下关联
        ApplicationController --> ApplicationService,则ApplicationController,ApplicationService都必须存在定义
        class ApplicationController {},class ApplicationService {}
        2.本次没有修改的类,如果需要关联,也要展现,包括方法,变量,要完整显示,如 class originalFeature {
                    +String name
                    +String printName() void
                }
        3.适当定义VO、DTO、DO 和 PO。

        - Program call flow: typing.Optional[str]  # IMPLEMENT ALL sequence Diagram Using sequenceDiagram code syntax, COMPLETE and VERY DETAILED, using CLASSES AND API DEFINED ABOVE accurately, covering the CRUD AND INIT of each object, SYNTAX MUST BE CORRECT.
        时序图必须遵循以下几点要求
        1.调用方法名来自"Data structures and interfaces"中定义的,如getAllDomains() 
        2.后端参与者必须细节到类, 不能用后端替代, 参数要标注类型,如id:String,返回值也必须有具体类型。前端参与者可以用前端页面统一替代, 不要详细到每个前端页面名称。
        3.如果有前端调用,必须标注http的method,request url。method只允许GET,POST
        4.如果后端用到数据库,则要将数据库作为参与者,并且描述操作的sql语句。
        5.用note over标注每个交互步骤,不要将多个流程放用同一个note over.
        6.所有时序步骤在同一个sequenceDiagram下,不要有多个sequenceDiagram开头
        例子如下：
        sequenceDiagram
            participant UI as 前端界面
            participant C1 as Controller1
            participant S1 as Service1
            participant DB as 数据库

            note over UI,DB: 查询所有订单列表
            UI ->> C1: /api/orders/getAllOrders
            C1 ->> S1:getAllOrders()
            S1 ->> DB:SELECT * FROM ORDERS
            DB -->>S1: List ~order~
            S1 -->>C1: List ~order~
            C1 -->> UI: List ~order~

            note over UI,DB: 查询订单详情
            UI ->> C1: /api/orders/getDetail/orderId
            C1 ->> S1:getDetailOrder(orderId:String)
            S1 ->> DB:SELECT * FROM ORDER by orderId
            DB -->>S1: order
            S1 -->>C1: order
            C1 -->> UI: order

        - Database operation:typing.List[str] # 用到的DDL,包括[修改]/[新增]/[数据迁移]


        - frontEnd clientApi: # Front end class diagram, including but not limited to entity classes and all types and interfaces that interact with the backend. The Mermaid classDiagram code syntax, including classes, methods, parameters, and return values, is very detailed and complete.

        - frontEnd flow chart: #REFER TO frontEnd clientApi,Refine the page flowchart to tsx files or classes, determine which method each page calls, and the method must be derived from the frontEnd clientApi class diagram, Use mermaid sequence Diagram code syntax.
        1.前端参与者细化到所有前端页面文件，类，接口，组件。后端不需要细化，可用后端代替。
        2.调用的方法必须来自frontEnd clientApi的类图,参数要标注类型,返回值也必须有具体类型
        3.页面间跳转要标注 动作和路由信息
        4.前端调用后端接口时,要标注method,request url。method必须是GET,POST。
        5.用note over标注每个交互步骤,不要将多个流程放用同一个note over.
        6.所有时序步骤在同一个sequenceDiagram下,不要有多个sequenceDiagram开头
        例子如下：
        sequenceDiagram 
            participant DL as DomainList.tsx 
            participant CL as CertificateList.tsx 
            participant CD as CertificateDetail.tsx 
            participant CA as certificateApi 
            participant BK as 后端 

            note over DL,CA: 查看域名关联证书列表  
            DL ->> CL: 点击域名行 (路由: /domains/:id/certificates)
            CL ->> CA: getCertificatesByDomain(domainId: string) 
            CA ->> BK: GET /certificate/getbydomain/domainId
            BK -->> CA:List~Certificate~
            CA -->> CL: List~Certificate~ 

            note over CL,CA: 查看证书详情 
            CL ->> CD: 点击证书行 (路由: /certificates/:id) 
            CD ->> CA: getCertificateDetail(id: string) 
            CA ->> BK: GET /certificate/getDetail/domainId
            BK -->> CA:Certificate
            CA -->> CD: Certificate

        - Total File list:首先, 必须实现"Data structures and interfaces",  "frontEnd clientApi"中定义的类, 不能遗漏。每个类由一个文件实现,不要一个文件实现全部类,例如有class A,class B,则A.java/tsx实现class A, B.java/tsx实现class B,文件名是类名。
          其次, 参考"Program call flow", "frontEnd flow chart"的内容, 检查File list是否有遗漏的文件, 如有将补充的文件和原来File list合并后一起展示, 仅补充必要的核心文件, 不要新增不重要的文件, 例如异常处理, 布局等非核心文件。
          Only need relative paths.只包括文件,不要写其他东西

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
            1.4 mapper接口不允许使用sql注解,只能用xml映射,如下
            错误写法
            @Mapper
            public interface AAA{
                @Select("SELECT * FROM table WHERE id = #{id}")
                List<A> selectById(@Param("id") Long id);
            }

            正确写法
            public interface AAA{
                List<A> selectById(@Param("id") Long id);
            }
            1.5 对于前端页面,每个class,interface和组件都要export导出,必须使用已经export的方法,不要引用和使用不存在的组件
            1.6 生成的前端代码,引用组件版本必须从package.json来,不能引用已经失效的组件,方法

            
        The code for each file should be enclosed in 3 reverse quotes, for example
            ${'```'}java
            ${'```'}.

        2.use tech stack.Generate code according to the following Technical Stack,strictly follow component version.
        frontEnd page MUST USE tsx format, NOT js file
        NOT USE JPA(Java Persistence API) and lombok to define a entity/dto class
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

        3. Follow design: YOU MUST FOLLOW "Data structures and interfaces" and "Program call flow" to implement code for back end, follow "frontEnd clientApi" and "frontEnd flow chart" to implement code for front end. DONT CHANGE ANY DESIGN. Do not use public member functions that do not exist in your design.
        The frontEnd calling interface must be generated using the "Full API spec", and the backEnd calling must use the methods provided in the class diagram

        4.Code integrity verification
        4.1 前端每个方法单独导出(使用export const),不要放在同一个对象里导出
        错误
        export const object = {
            export const method1 = () => {
            // 函数体
            };

            export const method2 = () => {
            // 函数体
            };
        };

        正确
        export const method1 = () => {
        // 函数体
        };

        export const method2 = () => {
        // 函数体
        };

        4.2 前端如果是接口,类型,使用import type引入,不要使用import,如
        import type { CertificateVO } from '../models/Certificate';
        export interface CertificateVO {}

        4.3前端枚举类定义改用纯对象 + as const
        正确
        export const CertificateStatus = {
            ACTIVE: 'ACTIVE',
            EXPIRED: 'EXPIRED',
            REVOKED: 'REVOKED',
            PENDING: 'PENDING',
        } as const;

        // 类型推导
        export type CertificateStatus = typeof CertificateStatus[keyof typeof CertificateStatus];

        错误
        export enum CertificateStatus {
            ACTIVE = 'ACTIVE',
            EXPIRED = 'EXPIRED',
            REVOKED = 'REVOKED',
            PENDING = 'PENDING'
        }

        4.4 Do not use non-existent components, methods, or variables in the front-end and back-end code. For example, in class A, use class b=new B();  b.methodB, Both Type B and Method B must have been implemented.
        4.5 The necessary fields of db must have a place to assign values, either through front-end or back-end settings.
        4.6 All front-end implemented function points must have page entrances.

    
        5. COMPLETE CODE: Your code will be part of the entire project, so please implement complete, reliable, reusable code snippets.
        6. Set default value: If there is any setting, ALWAYS SET A DEFAULT VALUE, ALWAYS USE STRONG TYPE AND EXPLICIT VARIABLE. AVOID circular import.
        
        7. CAREFULLY CHECK THAT YOU DONT MISS ANY NECESSARY CLASS/FUNCTION IN THIS FILE.
        8. Before using a external variable/module, make sure you import it first.
        9. Write out EVERY CODE DETAIL, DON'T LEAVE TODO.
     
      `
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
  'proj_adjust': {
    system: `You are a Project Manager, named Eve, your goal is break down tasks according to PRD/technical design, generate a task list, and analyze task dependencies to start with the prerequisite modules. the constraint is use same language as user requirement.`,
    user: `
          基于已有的内容: {adjust_content} 
          根据以下的输入的context内容进行优化
    
        ## context
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
            
            "Full API spec": "
            openapi: 3.0.0 ...
                paths:
                    /api/v2/users:
                        get:
                        deprecated: true  # [废弃] 使用/v3版本替代
                    /api/v3/users:
                        get:
                        description: "支持分页查询"",
            "Shared Knowledge": "game.py contains functions shared across the project.",
            "Anything UNCLEAR": "Clarification needed on how to start and initialize third-party libraries."
        }
        [/CONTENT]

        ## nodes: "<node>: <type>  # <instruction>"
        - Required packages: typing.Optional[typing.List[str]]  # Provide required third-party packages in requirements.txt format.   
        - Required Other language third-party packages: typing.List[str]  # List down the required packages for languages other than Python.
        - Logic Analysis: typing.List[typing.List[str]]  # Provide a list of files with the classes/methods/functions to be implemented, including dependency analysis and imports.
        - Task list: typing.List[str]  # Break down the tasks into a list of filenames, prioritized by dependency order.如果有前后端需求,要包括配置文件,如package.json,pom.xml,sql.
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

export function getPrompt(role: Role, action: ActionType): PromptParts {
  const key = `${role}_${action}`;
  console.log("===== key111===",key)
  
  if (!PROMPT_TEMPLATES[key]) {
    throw new Error(`No template found for ${key}`);
  }

  // 返回模板的深拷贝
  return JSON.parse(JSON.stringify(PROMPT_TEMPLATES[key]));
}