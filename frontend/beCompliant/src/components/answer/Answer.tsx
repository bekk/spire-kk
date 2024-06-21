import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Select, useToast,Textarea, Button, Popover, PopoverTrigger, Box, PopoverBody, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, useOutsideClick, useDisclosure, IconButton} from '@kvib/react';
import { RecordType } from '../../pages/Table';
import { Choice } from '../../hooks/datafetcher';
import colorUtils from '../../utils/colorUtils';
import React from 'react';

export type AnswerType = {
  questionId: string;
  Svar: string;
  updated: string;
  comment: string;
};

interface AnswerProps {
  choices: Choice[] | [];
  answer: string;
  record: RecordType;
  setFetchNewAnswers: Dispatch<SetStateAction<boolean>>;
  team?: string;
  comment?: string;
}

export const Answer = ({
  choices,
  answer,
  record,
  setFetchNewAnswers,
  team,
  comment,
}: AnswerProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    answer
  );
  const [selectedComment, setComment] = useState<string | undefined>(comment)
  const [commentIsOpen, setCommentIsOpen] = useState<boolean>(comment !== "")
  
  const backgroundColor = selectedAnswer
    ? colorUtils.getHexForColor(
        choices.find((choice) => choice.name === selectedAnswer)!.color
      ) ?? undefined
    : undefined;

  const toast = useToast();

  useEffect(() => {
    setSelectedAnswer(answer);
  }, [choices, answer]);

  const submitAnswer = async ( record: RecordType, answer?: string) => {
    const url = 'http://localhost:8080/answer'; // TODO: Place dev url to .env file
    const settings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actor: 'Unknown',
        questionId: record.fields.ID,
        question: record.fields.Aktivitet,
        Svar: answer,
        updated: '',
        team: team,
      }),
    };
    try {
      const response = await fetch(url, settings);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      toast({
        title: 'Suksess',
        description: 'Svaret ditt er lagret',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFetchNewAnswers(true);
    } catch (error) {
      console.error('There was an error with the submitAnswer request:', error);
      toast({
        title: 'Å nei!',
        description: 'Det har skjedd en feil. Prøv på nytt',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    return;
  };

  const submitComment = async (record: RecordType, comment?: string) => {
    const url = 'http://localhost:8080/comments'
    const settings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actor: 'Unknown',
        questionId: record.fields.ID,
        team: team,
        comment: comment,
        updated: '',
      }),
  };
  try {
    const response = await fetch(url, settings);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  } 
    catch (error) {
      console.error("Error submitting comment", error) }
}

  const handleAnswer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAnswer: string = e.target.value;
    if (newAnswer.length > 0) {
      setSelectedAnswer(newAnswer);
      submitAnswer(record, newAnswer);
    }
  };

  const handleCommentSubmit = () => {
    if(selectedComment !== comment) {
      submitComment(record, selectedComment)
    }
    }

  const handleCommentState = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
  }



  return (
   
      <><Select
      aria-label="select"
      placeholder="Velg alternativ"
      onChange={handleAnswer}
      value={selectedAnswer}
      width="170px"
      style={{ backgroundColor: backgroundColor }}
      marginBottom={2}
    >
      {choices.map((choice) => (
        <option value={choice.name} key={choice.id}>
          {choice.name}
        </option>
      ))}
    </Select>
    <Box>
        <Popover autoFocus={true} placement="bottom-start">
          <PopoverTrigger>
            <IconButton icon="data_info_alert" aria-label={''}></IconButton>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Kommentar</PopoverHeader>
            <PopoverBody>
              <Textarea
                marginBottom={2}
                marginTop={2}
                defaultValue={comment}
                onChange={handleCommentState}
                size="sm" />
              <Button
                size="xs"
                width="170px"
                onClick={handleCommentSubmit}>
                Lagre kommentar
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box></>
        
  );
};
