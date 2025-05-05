import { JournalLog } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { moodColors, energyLevelText, sleepQualityText, painLevelText } from "@/lib/healthMetrics";

interface JournalLogCardProps {
  journalLog: JournalLog;
  onEdit: (journalLog: JournalLog) => void;
  onDelete: (id: number) => void;
}

export function JournalLogCard({ journalLog, onEdit, onDelete }: JournalLogCardProps) {
  const {
    id,
    entryDate,
    content,
    mood,
    energyLevel,
    sleepQuality,
    painLevel,
    symptoms,
    medication,
  } = journalLog;

  const formattedDate = format(new Date(entryDate), "MMMM d, yyyy");
  const moodColor = moodColors[mood.toLowerCase()] || "bg-gray-200";

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{formattedDate}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Entry #{id}
            </CardDescription>
          </div>
          <Badge className={`${moodColor} uppercase`}>{mood}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Energy</p>
            <p className="font-medium">{energyLevelText[energyLevel]}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Sleep</p>
            <p className="font-medium">{sleepQualityText[sleepQuality]}</p>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-500">Pain</p>
            <p className="font-medium">{painLevelText[painLevel]}</p>
          </div>
        </div>
        
        {symptoms && symptoms.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Symptoms:</p>
            <div className="flex flex-wrap gap-1">
              {symptoms.map((symptom, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {medication && medication.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Medications:</p>
            <div className="flex flex-wrap gap-1">
              {medication.map((med, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                  {med}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(journalLog)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
