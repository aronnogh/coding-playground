import { promises as fs } from 'fs';
import path from 'path';
import Playground from '@/components/Playground';
import { Problem } from '@/types';

async function getProblems(): Promise<Problem[]> {
  const filePath = path.join(process.cwd(), 'data', 'problems.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function Home() {
  const problems = await getProblems();

  return <Playground problems={problems} />;
}
