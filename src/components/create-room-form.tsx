'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Copy, Loader2, PartyPopper } from 'lucide-react';

import { createRoomAndGetInvitation, type FormState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Create & Get Invitation'
      )}
    </Button>
  );
}

export function CreateRoomForm() {
  const initialState: FormState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(createRoomAndGetInvitation, initialState);
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    if (state.invitation) {
      setOpen(false); // Close the creation form
    }
  }, [state.invitation]);

  const handleCopyToClipboard = () => {
    if (state.invitation) {
      navigator.clipboard.writeText(state.invitation);
      toast({
        title: 'Copied to clipboard!',
        description: 'Invitation message is ready to be shared.',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Room</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className='font-headline'>Create a New Quiz Room</DialogTitle>
            <DialogDescription>
              Fill in the details below to start a new quiz.
            </DialogDescription>
          </DialogHeader>
          <form action={dispatch}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomName" className="text-right">
                  Room Name
                </Label>
                <div className="col-span-3">
                  <Input id="roomName" name="roomName" placeholder="e.g. Marvel Movie Night" />
                  {state.errors?.roomName && (
                    <p className="text-sm text-destructive mt-1">{state.errors.roomName[0]}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="questionCategory" className="text-right">
                  Category
                </Label>
                <div className="col-span-3">
                  <Select name="questionCategory">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Knowledge">General Knowledge</SelectItem>
                      <SelectItem value="Movies">Movies</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                  {state.errors?.questionCategory && (
                    <p className="text-sm text-destructive mt-1">{state.errors.questionCategory[0]}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numberOfQuestions" className="text-right">
                  Questions
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-4">
                    <Slider
                      id="numberOfQuestions"
                      name="numberOfQuestions"
                      min={5}
                      max={50}
                      step={1}
                      value={[questions]}
                      onValueChange={(value) => setQuestions(value[0])}
                    />
                    <span className="font-mono text-sm w-12 text-center">{questions}</span>
                  </div>
                   {state.errors?.numberOfQuestions && (
                    <p className="text-sm text-destructive mt-1">{state.errors.numberOfQuestions[0]}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduledTime" className="text-right">
                  Time
                </Label>
                 <div className="col-span-3">
                    <Input id="scheduledTime" name="scheduledTime" placeholder="e.g. Tomorrow at 8 PM" />
                     {state.errors?.scheduledTime && (
                        <p className="text-sm text-destructive mt-1">{state.errors.scheduledTime[0]}</p>
                      )}
                 </div>
              </div>
            </div>
            <DialogFooter>
              <SubmitButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!state.invitation} onOpenChange={() => (state.invitation = undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='font-headline flex items-center gap-2'>
              <PartyPopper className="w-6 h-6 text-accent" />
              Your Room is Ready!
            </DialogTitle>
            <DialogDescription>
              Share this invitation with your friends to join the quiz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea readOnly value={state.invitation} rows={5} className="bg-secondary" />
          </div>
          <DialogFooter>
            <Button onClick={handleCopyToClipboard} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}