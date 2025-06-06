import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const splitArray = (array: any[], size: number): any[] => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

export const formatChecklistToMarkdown = (data: any[]) => {
  // const grouped = new Map<string, Map<string, any[]>>();

  // // Nhóm dữ liệu theo category -> subCategory
  // for (const item of data) {
  //     if (!grouped.has(item.category)) {
  //         grouped.set(item.category, new Map());
  //     }
  //     const subMap = grouped.get(item.category)!;
  //     if (!subMap.has(item.subCategory)) {
  //         subMap.set(item.subCategory, []);
  //     }
  //     subMap.get(item.subCategory)!.push(item);
  // }

  // // Render Markdown
  // let output = "";
  // let catIndex = 1;

  // for (const [category, subMap] of grouped.entries()) {
  //     output += `# ${catIndex}. ${category}\n`;
  //     let subIndex = 1;

  //     for (const [subCategory, items] of subMap.entries()) {
  //         output += `## ${catIndex}.${subIndex}. ${subCategory}\n`;

  //         const sortedItems = items.sort((a, b) => a.number - b.number);

  //         sortedItems.forEach((item, idx) => {
  //             output += `${idx + 1}. [${item.number}] (Priority: ${item.priority}) ${item.content}\n`;
  //         });

  //         output += `\n`;
  //         subIndex++;
  //     }

  //     catIndex++;
  // }

  // return output.trim();

  const grouped = new Map<string, Map<string, any[]>>();
  const result: string[] = [];

  // Nhóm theo category -> subCategory
  for (const item of data) {
    if (!grouped.has(item.category)) {
      grouped.set(item.category, new Map());
    }
    const subMap = grouped.get(item.category)!;
    if (!subMap.has(item.subCategory)) {
      subMap.set(item.subCategory, []);
    }
    subMap.get(item.subCategory)!.push(item);
  }

  let catIndex = 1;

  for (const [category, subMap] of grouped.entries()) {
    let subIndex = 1;

    for (const [subCategory, items] of subMap.entries()) {
      const sortedItems = items.sort((a, b) => a.number - b.number);

      let section = `## ${catIndex}.${subIndex}. ${subCategory}\n`;

      sortedItems.forEach((item, idx) => {
        section += `${idx + 1}. [${item.number}] (Priority: ${item.priority}) (Checklist ID: ${item.id})  ${item.content}\n`;
      });

      result.push(section.trim());
      subIndex++;
    }

    catIndex++;
  }

  return result;
}