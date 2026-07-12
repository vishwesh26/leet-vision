const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const sub = await prisma.subTopic.findUnique({ where: { slug: 'complexity-analysis-time-complexity' }});
  if (!sub) return console.log('Not found');
  
  const fixedContent = sub.content.replace(/## Cheat Sheet[\s\S]*?(?=\n## |$)/, 
`## Cheat Sheet

| Complexity | Description | Examples | Common Operations |
|---|---|---|---|
| O(1) | Constant | Array index access, Hash Map lookup/insertion | Arithmetic ops, variable assignment, Stack push/pop |
| O(log n) | Logarithmic | Binary search, finding element in balanced BST | Halving search space |
| O(n) | Linear | Simple array/list traversal, linear search | Single loop iteration |
| O(n log n) | Linearithmic | Merge Sort, Quick Sort, Heap Sort | Divide and conquer sorts |
| O(n^2) | Quadratic | Nested loops, Bubble Sort, Insertion Sort | Comparing all pairs |
| O(2^n) | Exponential | Recursive Fibonacci (no memo), power set | Brute-force subsets |
| O(n!) | Factorial | Traveling Salesman (brute-force) | Generating permutations |

`);

  await prisma.subTopic.update({ where: { id: sub.id }, data: { content: fixedContent } });
  await prisma.article.update({ where: { subTopicId: sub.id }, data: { content: fixedContent } });
  console.log('Fixed table in DB!');
}

fix().finally(() => prisma.$disconnect());
