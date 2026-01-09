import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Type, Code, FileText, Image, Pencil, Link2, Lightbulb, X, Check, Search, ZoomIn, ZoomOut, Move, Sparkles, GripVertical } from 'lucide-react';
import { debounce } from 'lodash';
import { blockAPI, connectionAPI, analysisAPI } from './api/client';

// Programming reference notes + project notes
const initialBlocks = [
  // Python section
  {
    id: 'py-loops',
    type: 'code',
    x: 80,
    y: 80,
    width: 280,
    height: 160,
    content: `# Python for loops
for i in range(10):
    print(i)

for item in items:
    process(item)

for i, val in enumerate(items):
    print(f"{i}: {val}")`,
    language: 'python',
    tags: ['python', 'loops', 'syntax']
  },
  {
    id: 'py-lists',
    type: 'code',
    x: 80,
    y: 280,
    width: 280,
    height: 180,
    content: `# Python lists
items = [1, 2, 3]
items.append(4)
items.extend([5, 6])
items.insert(0, 0)
first = items[0]
last = items[-1]
sliced = items[1:3]

# List comprehension
squares = [x**2 for x in range(10)]`,
    language: 'python',
    tags: ['python', 'lists', 'syntax']
  },
  {
    id: 'py-types',
    type: 'markdown',
    x: 80,
    y: 500,
    width: 280,
    height: 150,
    content: `**Python Types**

\`int\` \`float\` \`str\` \`bool\`
\`list\` \`dict\` \`set\` \`tuple\`

Type hints:
\`def greet(name: str) -> str:\``,
    tags: ['python', 'types', 'syntax']
  },

  // TypeScript section
  {
    id: 'ts-loops',
    type: 'code',
    x: 420,
    y: 80,
    width: 300,
    height: 180,
    content: `// TypeScript for loops
for (let i = 0; i < 10; i++) {
  console.log(i);
}

for (const item of items) {
  process(item);
}

items.forEach((item, index) => {
  console.log(\`\${index}: \${item}\`);
});`,
    language: 'typescript',
    tags: ['typescript', 'loops', 'syntax']
  },
  {
    id: 'ts-arrays',
    type: 'code',
    x: 420,
    y: 300,
    width: 300,
    height: 200,
    content: `// TypeScript arrays
const items: number[] = [1, 2, 3];
items.push(4);
items.unshift(0);
const first = items[0];
const last = items[items.length - 1];
const sliced = items.slice(1, 3);

// Array methods
const squares = items.map(x => x ** 2);
const evens = items.filter(x => x % 2 === 0);
const sum = items.reduce((a, b) => a + b, 0);`,
    language: 'typescript',
    tags: ['typescript', 'arrays', 'syntax']
  },
  {
    id: 'ts-types',
    type: 'code',
    x: 420,
    y: 540,
    width: 300,
    height: 180,
    content: `// TypeScript types
type User = {
  id: number;
  name: string;
  email?: string; // optional
};

interface Product {
  sku: string;
  price: number;
}

type Status = "pending" | "done";`,
    language: 'typescript',
    tags: ['typescript', 'types', 'syntax']
  },

  // C# section
  {
    id: 'cs-loops',
    type: 'code',
    x: 780,
    y: 80,
    width: 300,
    height: 180,
    content: `// C# for loops
for (int i = 0; i < 10; i++) {
    Console.WriteLine(i);
}

foreach (var item in items) {
    Process(item);
}

for (int i = 0; i < items.Count; i++) {
    Console.WriteLine($"{i}: {items[i]}");
}`,
    language: 'csharp',
    tags: ['csharp', 'loops', 'syntax']
  },
  {
    id: 'cs-lists',
    type: 'code',
    x: 780,
    y: 300,
    width: 300,
    height: 200,
    content: `// C# Lists
var items = new List<int> { 1, 2, 3 };
items.Add(4);
items.AddRange(new[] { 5, 6 });
items.Insert(0, 0);
var first = items[0];
var last = items[^1]; // C# 8+
var sliced = items[1..3];

// LINQ
var squares = items.Select(x => x * x);
var evens = items.Where(x => x % 2 == 0);`,
    language: 'csharp',
    tags: ['csharp', 'lists', 'syntax']
  },
  {
    id: 'cs-types',
    type: 'code',
    x: 780,
    y: 540,
    width: 300,
    height: 160,
    content: `// C# types
public class User {
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Email { get; set; }
}

public record Product(string Sku, decimal Price);

public enum Status { Pending, Done }`,
    language: 'csharp',
    tags: ['csharp', 'types', 'syntax']
  },

  // Cross-language notes
  {
    id: 'compare-null',
    type: 'markdown',
    x: 1140,
    y: 100,
    width: 260,
    height: 180,
    content: `**Null/None Checks**

Python: \`if x is None:\`
TS: \`if (x === null)\`
C#: \`if (x is null)\`

Optional chaining:
TS: \`user?.email\`
C#: \`user?.Email\`
Python: \`getattr(user, 'email', None)\``,
    tags: ['python', 'typescript', 'csharp', 'null', 'comparison']
  },
  {
    id: 'compare-async',
    type: 'markdown',
    x: 1140,
    y: 320,
    width: 260,
    height: 200,
    content: `**Async Patterns**

Python:
\`async def fetch():\`
\`await get_data()\`

TypeScript:
\`async function fetch() {}\`
\`await getData()\`

C#:
\`async Task FetchAsync()\`
\`await GetDataAsync()\``,
    tags: ['python', 'typescript', 'csharp', 'async', 'comparison']
  },

  // Project notes (auth system from before)
  {
    id: 'auth-overview',
    type: 'markdown',
    x: 100,
    y: 750,
    width: 300,
    height: 140,
    content: `**Auth System Design**

JWT tokens with refresh rotation
OAuth2 (Google, GitHub)
Rate limiting on endpoints
Redis for session store`,
    tags: ['project', 'authentication', 'architecture']
  },
  {
    id: 'auth-code',
    type: 'code',
    x: 440,
    y: 750,
    width: 340,
    height: 160,
    content: `async def validate_token(token: str) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY)
        user = await db.users.get(payload["sub"])
        return user
    except JWTError:
        raise HTTPException(401)`,
    language: 'python',
    tags: ['project', 'authentication', 'jwt', 'python']
  },
  {
    id: 'auth-note',
    type: 'text',
    x: 820,
    y: 780,
    width: 260,
    height: 80,
    content: `Don't forget: OAuth callback needs state param for CSRF protection`,
    tags: ['project', 'authentication', 'oauth', 'security']
  },

  // Random useful snippets
  {
    id: 'git-commands',
    type: 'code',
    x: 1140,
    y: 560,
    width: 260,
    height: 180,
    content: `# Git quick reference
git stash
git stash pop
git rebase -i HEAD~3
git cherry-pick <sha>
git reset --soft HEAD~1
git reflog  # recover lost commits`,
    language: 'bash',
    tags: ['git', 'commands', 'reference']
  },
  {
    id: 'sql-joins',
    type: 'markdown',
    x: 1420,
    y: 100,
    width: 240,
    height: 160,
    content: `**SQL Joins**

INNER: both match
LEFT: all left + matches
RIGHT: all right + matches
FULL: all from both

\`ON a.id = b.a_id\``,
    tags: ['sql', 'database', 'reference']
  }
];

const initialConnections = [
  { id: 'c1', from: 'py-loops', to: 'ts-loops' },
  { id: 'c2', from: 'ts-loops', to: 'cs-loops' },
  { id: 'c3', from: 'auth-overview', to: 'auth-code' },
];

const mockSuggestions = [
  {
    id: 's1',
    type: 'relocate',
    blockId: 'auth-note',
    targetNear: 'auth-overview',
    reasoning: 'Your OAuth security note is related to the Auth System design. Moving it closer would keep all auth concepts together.',
    confidence: 0.91
  },
  {
    id: 's2',
    type: 'connect',
    blockId: 'auth-code',
    targetId: 'py-types',
    reasoning: 'Your auth code uses Python type hints. Consider linking to your Python types reference.',
    confidence: 0.72
  },
  {
    id: 's3',
    type: 'group',
    blockIds: ['compare-null', 'compare-async'],
    reasoning: 'These cross-language comparison notes could be grouped into a "Language Comparisons" section.',
    confidence: 0.85
  }
];

// Simple markdown renderer
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    line = line.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono text-pink-600">$1</code>');
    
    if (line.startsWith('# ')) {
      return <h1 key={i} className="text-lg font-bold mb-2" dangerouslySetInnerHTML={{__html: line.slice(2)}} />;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-md font-semibold mb-1" dangerouslySetInnerHTML={{__html: line.slice(3)}} />;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 list-disc text-sm" dangerouslySetInnerHTML={{__html: line.slice(2)}} />;
    }
    if (line === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm" dangerouslySetInnerHTML={{__html: line}} />;
  });
};

// Syntax highlighting with proper tokenization
const highlightCode = (code, language) => {
  const keywords = {
    python: ['def', 'async', 'await', 'for', 'in', 'if', 'else', 'elif', 'try', 'except', 'return', 'import', 'from', 'class', 'None', 'True', 'False', 'raise', 'with', 'as', 'lambda', 'and', 'or', 'not', 'is'],
    typescript: ['const', 'let', 'var', 'function', 'async', 'await', 'for', 'of', 'in', 'if', 'else', 'return', 'import', 'from', 'export', 'type', 'interface', 'class', 'null', 'undefined', 'true', 'false', 'new', 'this', 'typeof', 'extends', 'implements'],
    csharp: ['public', 'private', 'class', 'record', 'enum', 'async', 'await', 'for', 'foreach', 'var', 'in', 'if', 'else', 'return', 'using', 'new', 'null', 'true', 'false', 'get', 'set', 'void', 'int', 'string', 'bool', 'decimal', 'Task'],
    bash: ['git', 'cd', 'ls', 'echo', 'export', 'source', 'sudo', 'apt', 'npm', 'pip']
  };
  
  const langKeywords = new Set(keywords[language] || keywords.typescript);
  const commentChar = (language === 'python' || language === 'bash') ? '#' : '//';
  
  // Process line by line
  return code.split('\n').map(line => {
    // Check for comment
    const commentIndex = line.indexOf(commentChar);
    let codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
    let commentPart = commentIndex >= 0 ? line.slice(commentIndex) : '';
    
    // Tokenize the code part
    const tokens = [];
    let current = '';
    let inString = null;
    
    for (let i = 0; i < codePart.length; i++) {
      const char = codePart[i];
      
      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && (i === 0 || codePart[i-1] !== '\\')) {
        if (inString === char) {
          // End of string
          current += char;
          tokens.push({ type: 'string', value: current });
          current = '';
          inString = null;
        } else if (!inString) {
          // Start of string
          if (current) tokens.push({ type: 'code', value: current });
          current = char;
          inString = char;
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }
    if (current) tokens.push({ type: inString ? 'string' : 'code', value: current });
    
    // Process each token
    const highlighted = tokens.map(token => {
      if (token.type === 'string') {
        return `<span class="text-amber-400">${escapeHtml(token.value)}</span>`;
      }
      
      // Process code: highlight keywords, numbers, and function calls
      return token.value.split(/(\b\w+\b|[^\w]+)/g).map(part => {
        if (!part) return '';
        if (langKeywords.has(part)) {
          return `<span class="text-purple-400">${part}</span>`;
        }
        if (/^\d+$/.test(part)) {
          return `<span class="text-cyan-400">${part}</span>`;
        }
        return escapeHtml(part);
      }).join('');
    }).join('');
    
    // Add comment if present
    if (commentPart) {
      return highlighted + `<span class="text-gray-500">${escapeHtml(commentPart)}</span>`;
    }
    return highlighted;
  }).join('\n');
};

// Helper to escape HTML
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Block component with hover reveal
const Block = ({ block, isSelected, onSelect, onDrag, highlightRelated, isHovered, onHover }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const isRelated = highlightRelated && highlightRelated.includes(block.id);
  const showChrome = isHovered || isSelected || isDragging;
  
  const handleMouseDown = (e) => {
    if (e.target.closest('.block-content-inner')) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - block.x, y: e.clientY - block.y });
    onSelect(block.id);
  };
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      onDrag(block.id, e.clientX - dragStart.x, e.clientY - dragStart.y);
    }
  }, [isDragging, dragStart, block.id, onDrag]);
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const getBackgroundStyle = () => {
    if (block.type === 'code') {
      return showChrome 
        ? 'bg-gray-900/95 border-gray-600' 
        : 'bg-gray-900/80 border-transparent';
    }
    return showChrome 
      ? 'bg-white/95 border-gray-300 shadow-lg' 
      : 'bg-white/60 border-transparent';
  };

  const langColors = {
    python: 'text-yellow-500',
    typescript: 'text-blue-500',
    csharp: 'text-green-500',
    bash: 'text-gray-400',
    javascript: 'text-yellow-400'
  };

  return (
    <div
      className={`absolute rounded-xl border-2 transition-all duration-200 ${getBackgroundStyle()} ${isRelated ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
        zIndex: isSelected ? 100 : isDragging ? 99 : 1
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => onHover(block.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Drag handle - only visible on hover */}
      <div className={`absolute -left-1 top-1/2 -translate-y-1/2 p-1 rounded cursor-move transition-opacity duration-200 ${showChrome ? 'opacity-40 hover:opacity-100' : 'opacity-0'}`}>
        <GripVertical size={14} className="text-gray-400" />
      </div>

      {/* Language badge for code blocks */}
      {block.type === 'code' && block.language && (
        <div className={`absolute -top-3 left-3 px-2 py-0.5 text-xs font-medium rounded transition-opacity duration-200 ${showChrome ? 'opacity-100' : 'opacity-0'} ${langColors[block.language] || 'text-gray-400'} bg-gray-800`}>
          {block.language}
        </div>
      )}
      
      {/* Block content */}
      <div className="block-content-inner p-4 overflow-auto h-full cursor-text" style={{ scrollbarWidth: 'thin' }}>
        {block.type === 'text' && (
          <p className="text-sm text-gray-700 leading-relaxed">{block.content}</p>
        )}
        {block.type === 'markdown' && (
          <div className="text-gray-700 leading-relaxed">{renderMarkdown(block.content)}</div>
        )}
        {block.type === 'code' && (
          <pre 
            className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightCode(block.content, block.language) }}
          />
        )}
        {block.type === 'image' && (
          <img src={block.content} alt="Block" className="w-full h-full object-cover rounded" />
        )}
      </div>
      
      {/* Tags - only visible on hover */}
      {block.tags && block.tags.length > 0 && showChrome && (
        <div className="absolute -bottom-7 left-2 flex gap-1 flex-wrap transition-opacity duration-200">
          {block.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 bg-gray-800/80 text-gray-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Resize handle - only visible on hover */}
      <div className={`absolute bottom-1 right-1 w-3 h-3 cursor-se-resize transition-opacity duration-200 ${showChrome ? 'opacity-40 hover:opacity-100' : 'opacity-0'}`}>
        <svg viewBox="0 0 10 10" className="w-full h-full text-gray-400">
          <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

// Connection line component
const ConnectionLine = ({ from, to, blocks }) => {
  const fromBlock = blocks.find(b => b.id === from);
  const toBlock = blocks.find(b => b.id === to);
  
  if (!fromBlock || !toBlock) return null;
  
  const x1 = fromBlock.x + fromBlock.width;
  const y1 = fromBlock.y + fromBlock.height / 2;
  const x2 = toBlock.x;
  const y2 = toBlock.y + toBlock.height / 2;
  
  // Control points for bezier curve
  const dx = Math.abs(x2 - x1);
  const controlOffset = Math.min(dx * 0.5, 80);
  
  return (
    <path
      d={`M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`}
      fill="none"
      stroke="rgba(148, 163, 184, 0.4)"
      strokeWidth="2"
      strokeDasharray="6 4"
      markerEnd="url(#arrowhead)"
    />
  );
};

// Suggestion card component
const SuggestionCard = ({ suggestion, blocks, onAccept, onDismiss, onHover }) => {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'relocate': return <Move size={16} />;
      case 'connect': return <Link2 size={16} />;
      case 'group': return <Sparkles size={16} />;
      default: return <Lightbulb size={16} />;
    }
  };
  
  const getTitle = () => {
    switch (suggestion.type) {
      case 'relocate': return 'Relocate';
      case 'connect': return 'Connect';
      case 'group': return 'Group';
      default: return 'Suggestion';
    }
  };

  const relatedIds = suggestion.blockIds || [suggestion.blockId, suggestion.targetId].filter(Boolean);
  
  return (
    <div 
      className="bg-white/90 backdrop-blur rounded-xl border border-purple-200/50 p-3 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer"
      onMouseEnter={() => onHover(relatedIds)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
          {getIcon()}
        </div>
        <span className="font-medium text-sm text-gray-800">{getTitle()}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full" 
              style={{ width: `${suggestion.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{suggestion.reasoning}</p>
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onAccept(suggestion.id); }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Check size={12} /> Accept
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(suggestion.id); }}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={12} /> Dismiss
        </button>
      </div>
    </div>
  );
};

// Toolbar component
const Toolbar = ({ onAddBlock, zoom, onZoomIn, onZoomOut, onAnalyze, onSearch }) => {
  const blockTypes = [
    { type: 'text', icon: <Type size={18} />, label: 'Text' },
    { type: 'markdown', icon: <FileText size={18} />, label: 'Markdown' },
    { type: 'code', icon: <Code size={18} />, label: 'Code' },
    { type: 'image', icon: <Image size={18} />, label: 'Image' },
    { type: 'drawing', icon: <Pencil size={18} />, label: 'Drawing' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 px-3 py-2 z-50">
      <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
        {blockTypes.map(({ type, icon, label }) => (
          <button
            key={type}
            onClick={() => onAddBlock(type)}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
            title={`Add ${label}`}
          >
            {icon}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-1 px-2 border-r border-gray-200">
        <button onClick={onZoomOut} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all">
          <ZoomOut size={18} />
        </button>
        <span className="text-sm text-gray-400 w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all">
          <ZoomIn size={18} />
        </button>
      </div>

      <div className="flex items-center gap-1 pl-2">
        <button
          onClick={onSearch}
          className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
          title="Search"
        >
          <Search size={18} />
        </button>
        <button
          onClick={onAnalyze}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Sparkles size={16} />
          <span className="text-sm font-medium">Analyze</span>
        </button>
      </div>
    </div>
  );
};

// Search dialog
const SearchDialog = ({ isOpen, onClose, blocks, onNavigate }) => {
  const [query, setQuery] = useState('');
  
  if (!isOpen) return null;
  
  const results = query.length > 1 
    ? blocks.filter(b => 
        b.content.toLowerCase().includes(query.toLowerCase()) ||
        b.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-start justify-center pt-32" onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes, code, tags..."
            className="flex-1 text-lg outline-none placeholder:text-gray-400"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">ESC</kbd>
        </div>
        {results.length > 0 && (
          <div className="max-h-80 overflow-auto p-2">
            {results.map(block => (
              <button
                key={block.id}
                onClick={() => { onNavigate(block); onClose(); }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${block.type === 'code' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {block.type}
                  </span>
                  {block.language && (
                    <span className="text-xs text-purple-600">{block.language}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 truncate">{block.content.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        )}
        {query.length > 1 && results.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No results for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

// Calculate semantic similarity between blocks (simple keyword-based for now)
const calculateSimilarity = (block1, block2) => {
  const getText = (b) => `${b.content} ${b.tags?.join(' ') || ''} ${b.language || ''}`.toLowerCase();
  const text1 = getText(block1);
  const text2 = getText(block2);

  // Extract words
  const words1 = new Set(text1.match(/\w+/g) || []);
  const words2 = new Set(text2.match(/\w+/g) || []);

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
};

// Find related blocks using semantic similarity
const findRelatedBlocks = (blocks) => {
  const similarities = [];

  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const similarity = calculateSimilarity(blocks[i], blocks[j]);
      if (similarity > 0.1) { // Threshold for relevance
        similarities.push({
          block1: blocks[i],
          block2: blocks[j],
          similarity
        });
      }
    }
  }

  return similarities.sort((a, b) => b.similarity - a.similarity);
};

// OpenRouter API integration with chain-of-thought reasoning
const analyzeCanvas = async (blocks, connections, onThought) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('OpenRouter API key not configured');
    return { suggestions: [], thoughts: ['Error: API key not configured'] };
  }

  // Calculate semantic relationships
  onThought?.('Analyzing semantic relationships between blocks...');
  const relatedPairs = findRelatedBlocks(blocks);

  // Find blocks that are far apart but semantically similar
  const distantButRelated = relatedPairs
    .filter(pair => {
      const distance = Math.sqrt(
        Math.pow(pair.block1.x - pair.block2.x, 2) +
        Math.pow(pair.block1.y - pair.block2.y, 2)
      );
      return distance > 500 && pair.similarity > 0.15;
    })
    .slice(0, 5);

  // Find blocks without connections that should be connected
  const existingConnections = new Set(
    connections.map(c => `${c.from}-${c.to}`)
  );

  const missingConnections = relatedPairs
    .filter(pair =>
      !existingConnections.has(`${pair.block1.id}-${pair.block2.id}`) &&
      !existingConnections.has(`${pair.block2.id}-${pair.block1.id}`) &&
      pair.similarity > 0.2
    )
    .slice(0, 5);

  // Prepare context for AI with semantic analysis
  const canvasContext = {
    totalBlocks: blocks.length,
    totalConnections: connections.length,
    blocks: blocks.map(b => ({
      id: b.id,
      type: b.type,
      content: b.content.slice(0, 150),
      language: b.language,
      tags: b.tags,
      position: { x: b.x, y: b.y }
    })),
    connections: connections,
    semanticAnalysis: {
      distantButRelated: distantButRelated.map(p => ({
        block1: p.block1.id,
        block2: p.block2.id,
        similarity: p.similarity.toFixed(2),
        distance: Math.sqrt(
          Math.pow(p.block1.x - p.block2.x, 2) +
          Math.pow(p.block1.y - p.block2.y, 2)
        ).toFixed(0)
      })),
      missingConnections: missingConnections.map(p => ({
        block1: p.block1.id,
        block2: p.block2.id,
        similarity: p.similarity.toFixed(2)
      }))
    }
  };

  const prompt = `You are an expert at analyzing semantic canvases and knowledge organization.

Your task is to analyze this canvas and provide specific, actionable suggestions.

Canvas Data:
${JSON.stringify(canvasContext, null, 2)}

THINK STEP BY STEP:

1. First, observe the canvas layout and content organization
2. Identify semantic relationships between blocks (common topics, tags, languages)
3. Look for blocks that are distant but should be near each other
4. Find missing connections between related content
5. Consider grouping opportunities for similar blocks

After your analysis, provide 3-5 concrete suggestions in this JSON format:
[
  {
    "type": "relocate" | "connect" | "group",
    "blockId": "id of block to act on",
    "targetId": "id of related block (for connect)",
    "targetNear": "id of block to move near (for relocate)",
    "blockIds": ["id1", "id2", ...] (for group),
    "reasoning": "detailed explanation of WHY this suggestion makes sense",
    "confidence": 0.0-1.0
  }
]

Format your response as:

ANALYSIS:
[Your step-by-step thinking here]

SUGGESTIONS:
\`\`\`json
[Your JSON array here]
\`\`\`

Be specific and reference actual block IDs and content.`;

  try {
    onThought?.('Sending canvas data to AI for analysis...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'Semantic Canvas'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.6v',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return { suggestions: [], thoughts: [`API Error: ${error}`] };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('No content in response');
      return { suggestions: [], thoughts: ['Error: No response from AI'] };
    }

    onThought?.('Processing AI response...');

    // Extract analysis and suggestions
    const analysisPart = content.match(/ANALYSIS:([\s\S]*?)(?=SUGGESTIONS:|```json|$)/i);
    const thoughts = analysisPart ? [analysisPart[1].trim()] : [content];

    // Parse JSON from response
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // Try to find JSON array in the response
      const arrayMatch = jsonStr.match(/\[\s*{[\s\S]*}\s*\]/);
      if (arrayMatch) {
        jsonStr = arrayMatch[0];
      }
    }

    const suggestions = JSON.parse(jsonStr);

    // Add unique IDs to suggestions
    const suggestionsWithIds = suggestions.map((s, i) => ({
      ...s,
      id: `ai-${Date.now()}-${i}`
    }));

    return {
      suggestions: suggestionsWithIds,
      thoughts
    };
  } catch (error) {
    console.error('Error analyzing canvas:', error);
    return {
      suggestions: [],
      thoughts: [`Error during analysis: ${error.message}`]
    };
  }
};

// Main App
export default function SemanticCanvasPrototype() {
  const [blocks, setBlocks] = useState([]);
  const [connections, setConnections] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [highlightRelated, setHighlightRelated] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 50, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisThoughts, setAnalysisThoughts] = useState([]);
  const [currentThought, setCurrentThought] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Fetch blocks and connections on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [blocksData, connectionsData] = await Promise.all([
          blockAPI.getAll(),
          connectionAPI.getAll(),
        ]);
        setBlocks(blocksData.blocks || []);
        setConnections(connectionsData.connections || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
        // Use fallback data if API fails
        setBlocks(initialBlocks);
        setConnections(initialConnections);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSelectedBlock(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced save for position updates
  const debouncedSavePosition = useCallback(
    debounce(async (id, x, y) => {
      try {
        await blockAPI.update(id, { x, y });
      } catch (err) {
        console.error('Failed to save position:', err);
      }
    }, 1000),
    []
  );

  const handleDrag = (id, x, y) => {
    // Update UI immediately (optimistic update)
    setBlocks(blocks.map(b => b.id === id ? { ...b, x, y } : b));
    // Save to backend (debounced)
    debouncedSavePosition(id, x, y);
  };

  const handleAddBlock = async (type) => {
    const newBlock = {
      type,
      x: (-pan.x / zoom) + 400 + Math.random() * 50,
      y: (-pan.y / zoom) + 300 + Math.random() * 50,
      width: type === 'code' ? 320 : 260,
      height: type === 'code' ? 180 : 120,
      content: type === 'code'
        ? '// New code block\n'
        : type === 'markdown'
        ? '**New Note**\n\nStart writing...'
        : 'New note...',
      language: type === 'code' ? 'typescript' : undefined,
      tags: []
    };

    try {
      // Call API to create block
      const response = await blockAPI.create(newBlock);

      // Add block to state
      setBlocks([...blocks, response.block]);
      setSelectedBlock(response.block.id);

      // Show auto-suggestions if present
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions([...suggestions, ...response.suggestions]);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('Failed to create block:', err);
      alert('Failed to create block: ' + err.message);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowSuggestions(true);
    setSuggestions([]);
    setAnalysisThoughts([]);
    setCurrentThought('Analyzing canvas...');

    try {
      const result = await analysisAPI.analyzeCanvas();

      setSuggestions(result.suggestions || []);
      setAnalysisThoughts(result.thoughts || []);
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisThoughts([`Analysis failed: ${err.message}`]);
    } finally {
      setCurrentThought('');
      setIsAnalyzing(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    try {
      if (suggestion.type === 'relocate' && suggestion.targetNear) {
        const targetBlock = blocks.find(b => b.id === suggestion.targetNear);
        if (targetBlock) {
          const newX = targetBlock.x + targetBlock.width + 40;
          const newY = targetBlock.y;

          // Update position via API
          await blockAPI.update(suggestion.blockId, { x: newX, y: newY });

          // Update UI
          setBlocks(blocks.map(b =>
            b.id === suggestion.blockId
              ? { ...b, x: newX, y: newY }
              : b
          ));
        }
      }

      if (suggestion.type === 'connect') {
        const connectionData = {
          from_block: suggestion.blockId,
          to_block: suggestion.targetId
        };

        // Create connection via API
        const response = await connectionAPI.create(connectionData);

        // Update UI
        setConnections([...connections, response.connection]);
      }

      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error('Failed to accept suggestion:', err);
      alert('Failed to apply suggestion: ' + err.message);
    }
  };

  const handleDismissSuggestion = (suggestionId) => {
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };

  const handleNavigateToBlock = (block) => {
    setPan({ 
      x: -block.x * zoom + window.innerWidth / 2 - block.width / 2,
      y: -block.y * zoom + window.innerHeight / 2 - block.height / 2
    });
    setSelectedBlock(block.id);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-background')) {
      setSelectedBlock(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + scroll
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
    } else {
      // Pan with two-finger scroll
      e.preventDefault();
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY
      }));
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-lg text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Error notification */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        onAddBlock={handleAddBlock}
        zoom={zoom}
        onZoomIn={() => setZoom(Math.min(2, zoom + 0.1))}
        onZoomOut={() => setZoom(Math.max(0.3, zoom - 0.1))}
        onAnalyze={handleAnalyze}
        onSearch={() => setShowSearch(true)}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        {/* Dot grid background */}
        <div 
          className="canvas-background absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {/* Transform container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: 3000, height: 2000, overflow: 'visible' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="rgba(148, 163, 184, 0.4)" />
              </marker>
            </defs>
            {connections.map(conn => (
              <ConnectionLine key={conn.id} {...conn} blocks={blocks} />
            ))}
          </svg>

          {/* Blocks */}
          {blocks.map(block => (
            <Block
              key={block.id}
              block={block}
              isSelected={selectedBlock === block.id}
              isHovered={hoveredBlock === block.id}
              onSelect={setSelectedBlock}
              onDrag={handleDrag}
              onHover={setHoveredBlock}
              highlightRelated={highlightRelated}
            />
          ))}
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <div className="absolute top-20 right-4 w-80 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-800">AI Insights</span>
            </div>
            <div className="flex items-center gap-2">
              {suggestions.length > 0 && (
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  {suggestions.length}
                </span>
              )}
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="p-3 space-y-3 max-h-[calc(100vh-200px)] overflow-auto">
            {/* Show AI's thinking process */}
            {analysisThoughts.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple-600" />
                  <span className="text-xs font-semibold text-purple-800">AI Analysis</span>
                </div>
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {analysisThoughts[0]}
                </div>
              </div>
            )}

            {isAnalyzing ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Sparkles size={24} className="text-white" />
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {currentThought || 'Analyzing your canvas...'}
                </p>
              </div>
            ) : suggestions.length === 0 && analysisThoughts.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  Looking good! No suggestions right now.
                </p>
              </div>
            ) : (
              suggestions.map(suggestion => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  blocks={blocks}
                  onAccept={handleAcceptSuggestion}
                  onDismiss={handleDismissSuggestion}
                  onHover={setHighlightRelated}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        blocks={blocks}
        onNavigate={handleNavigateToBlock}
      />

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/80 rounded border border-gray-200 font-mono">⌘K</kbd>
          Search
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-white/80 rounded border border-gray-200 font-mono">⌘</kbd>
          <span>+ scroll to zoom</span>
        </span>
      </div>

      {/* Status */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
        {blocks.length} notes · {connections.length} connections
      </div>
    </div>
  );
}
