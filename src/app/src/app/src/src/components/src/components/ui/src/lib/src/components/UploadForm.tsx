'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building,
  Loader2,
  Send,
  UploadCloud,
  User,
  X,
  FileImage,
  PlusCircle,
  Trash2,
} from 'lucide-react';

import { submitConfirmations } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const fileSchema = z
  .any()
  .refine((files) => files?.length === 1, 'A screenshot is required.')
  .refine(
    (files) => files?.[0]?.size <= MAX_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
    '.jpg, .jpeg, .png and .webp files are accepted.'
  );

const submissionEntrySchema = z.object({
  contractorName: z
    .string()
    .min(2, 'Contractor name must be at least 2 characters.'),
  screenshot: fileSchema,
});

const formSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters.'),
  submissions: z
    .array(submissionEntrySchema)
    .min(1, 'At least one submission is required.'),
});

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <Send className="mr-2" />
          Submit Confirmations
        </>
      )}
    </Button>
  );
}

export function UploadForm() {
  const [state, formAction] = useFormState(submitConfirmations, initialState);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      submissions: [{ contractorName: '', screenshot: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'submissions',
  });

  React.useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        form.reset({
          companyName: form.getValues('companyName'), // keep company name
          submissions: [{ contractorName: '', screenshot: undefined }],
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Oops!',
          description: state.message,
        });
      }
    }
  }, [state, toast, form]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Submission Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        placeholder="e.g. Innovate Inc."
                        {...field}
                        className="pl-9"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {fields.map((field, index) => {
              const watchedFile = form.watch(
                `submissions.${index}.screenshot`
              );
              return (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-4 relative bg-card"
                >
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove submission</span>
                    </Button>
                  )}
                  <FormField
                    control={form.control}
                    name={`submissions.${index}.contractorName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contractor Name</FormLabel>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              placeholder="e.g. John Doe"
                              {...field}
                              className="pl-9"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`submissions.${index}.screenshot`}
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                      <FormItem>
                        <FormLabel>Screenshot Upload</FormLabel>
                        <FormControl>
                          <div>
                            <label
                              htmlFor={`screenshot-input-${index}`}
                              className={cn(
                                'relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent/50 transition-colors',
                                { 'bg-muted/50': watchedFile && watchedFile.length > 0 }
                              )}
                            >
                              {watchedFile && watchedFile.length > 0 ? (
                                <div className="text-center p-4">
                                  <FileImage className="mx-auto h-12 w-12 text-gray-500" />
                                  <p className="font-semibold truncate">
                                    {watchedFile[0].name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(
                                      watchedFile[0].size /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{' '}
                                    MB
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <UploadCloud className="h-10 w-10 mb-3 text-gray-400" />
                                  <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">
                                      Click to upload
                                    </span>{' '}
                                    or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, or WEBP (MAX. 5MB)
                                  </p>
                                </div>
                              )}
                            </label>
                            <Input
                              id={`screenshot-input-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={ref}
                              name={name}
                              onBlur={onBlur}
                              onChange={(e) => onChange(e.target.files)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                append({ contractorName: '', screenshot: undefined })
              }
            >
              <PlusCircle className="mr-2" />
              Add Another Submission
            </Button>

            <SubmitButton />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
