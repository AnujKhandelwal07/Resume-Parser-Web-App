import json
import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_groq import ChatGroq
 
load_dotenv()
 
# Access the API key
groq_api_key = os.getenv("GROQ_API_KEY")
 
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is missing! Check your .env file.")
 
# Initialize Groq model
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    max_tokens=1000,
    timeout=30,
    max_retries=2,
    groq_api_key=groq_api_key
)

def extract_info_from_text(resume_text):
    """
    Extracts structured information from resume text using Groq LLM.
    Provides more robust parsing with clearer instructions.
    """
   
    # More detailed prompt template with explicit formatting instructions
    prompt_template = PromptTemplate(
        input_variables=["resume_text"],
        template="""
        You are a professional resume parser. Extract structured information from the following resume text.
       
        PARSING INSTRUCTIONS:
        1. Education: Extract full educational history with school names, graduation dates, and academic achievements
        2. Work Experience: Capture all work experiences with company names, roles, dates, and key responsibilities
        3. Total Years of Experience: Calculate total professional work experience in years
       
        OUTPUT FORMAT (STRICT JSON):
        {{
            "education": [
                {{
                    "school": "",
                    "degree": "",
                    "graduationDate": "",
                    "achievement": ""
                }}
            ],
            "workExperience": [
                {{
                    "companyName": "",
                    "role": "",
                    "period": "",
                    "responsibilities": []
                }}
            ],
            "totalYrExp": ""
        }}
       
        Resume Text:
        {resume_text}
       
        Respond ONLY with valid JSON. No additional text or explanations.
        """
    )
 
    # Create a runnable sequence (replacing deprecated LLMChain)
    chain = prompt_template | llm
 
    try:
        # Invoke the chain and get response
        response = chain.invoke({"resume_text": resume_text})
       
        # Extract the content from AIMessage
        response_text = response.content if hasattr(response, 'content') else str(response)
       
        # Clean and parse JSON response
        cleaned_response = response_text.replace("'", '"')
        extracted_data = json.loads(cleaned_response)
       
        return extracted_data
   
    except json.JSONDecodeError as e:
        print(f"JSON Parsing Error: {e}")
        print(f"Raw Response: {response_text}")
        return {
            "error": "Failed to parse JSON",
            "raw_response": response_text
        }
    except Exception as e:
        print(f"Unexpected Error: {e}")
        return {
            "error": str(e),
            "raw_response": str(response)
        }