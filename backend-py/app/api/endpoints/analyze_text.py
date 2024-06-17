from fastapi import APIRouter, HTTPException
from app.models.text_input import TextInput
from app.models.text_analysis_output import TextAnalysisOutput

router = APIRouter()


@router.post("/analyze_text", response_model=TextAnalysisOutput)
async def analyze_text(input: TextInput):
    try:
        print("text_input:", input)
        return TextAnalysisOutput(response=input.text, metadata={})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
