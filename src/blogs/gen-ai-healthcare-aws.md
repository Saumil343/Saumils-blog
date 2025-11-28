---
title: "Gen-AI Powered Healthcare Queries with AWS Kendra & Bedrock"
date: "2025-08-15"
category: "Agentic AI"
excerpt: "Exploring how to build intelligent healthcare query systems using AWS Kendra for search and AWS Bedrock for generative AI capabilities."
---

**Authors:** Saumil Shah, Piyush Jalan  
**Service Category:** Cloud Native

## Introduction

In the healthcare industry, having accurate and contextually relevant information readily accessible is crucial for clinicians, patients, and administrative staff. Simple keyword-based searches can often fall short, offering information that lacks the specificity and depth required in a clinical setting. To address this, a solution was developed using AWS Kendra for intelligent search and AWS Bedrock for generative AI, enabling healthcare clients to receive not only relevant information but also enhanced, context-sensitive responses.

## Business Problem

Healthcare professionals and patients frequently seek precise answers to complex medical questions. Standard keyword-based search systems may retrieve general documents but often lack the contextual accuracy needed in critical medical situations. Moreover, clinicians often require enhanced responses that go beyond straightforward answers to provide additional insights. This solution addresses these challenges by combining Kendra's reliable document retrieval capabilities with Bedrock's generative AI model to deliver well-rounded, contextually aware responses.

## Solution Overview

![AWS Kendra and Bedrock Architecture](/Saumils-blog/images/kendra-bedrock-GenAI-Arch.png)

This healthcare-focused solution integrates two powerful AWS tools:

- **AWS Kendra**: Acts as the primary search engine, retrieving high-precision information from reliable medical documents based on user queries. Kendra enables clinicians and patients to access the exact information they need without time-consuming manual searches.

- **AWS Bedrock (Gen-AI)**: Adds depth and clarity to Kendra's responses by generating enhanced, context-sensitive answers. Bedrock's language generation capabilities allow for tailored responses that vary in complexity to suit different audiences, from healthcare professionals to patients.

The solution uses Python to integrate these services, ensuring smooth communication and data processing across both AWS tools and enabling scalability for diverse healthcare applications.

## Technical Implementation

This implementation involves the following steps:

### 1. AWS Kendra Query for Information Retrieval

- A Kendra client is initialized with the designated AWS region and index ID.
- The user's query text (e.g., "What are the warning signs for DKA?") is sent to Kendra, which retrieves relevant medical information.
- **Result Parsing**: The response items from Kendra are filtered to extract the most relevant answer (e.g., through Highlights attributes) to be used for further processing.

#### Creating a Kendra Index

![Creating Kendra Index](/Saumils-blog/images/gen-ai-healthcare/step1.png)

#### Adding a Data Source to Kendra

![Adding Data Source - Step 1](/Saumils-blog/images/gen-ai-healthcare/step2.png)

![Adding Data Source - Step 2](/Saumils-blog/images/gen-ai-healthcare/step3.png)

![Adding Data Source - Step 3](/Saumils-blog/images/gen-ai-healthcare/step4.png)

### 2. Enhanced Response Generation with AWS Bedrock

- The solution utilizes 'amazon.titan-text-lite-v1' bedrock model.
- A Bedrock client is invoked to generate an enriched, context-sensitive answer based on Kendra's initial response.
- The context and original question are structured into a prompt format to enhance Bedrock's generative model's output.
- **Generative Configuration**: Parameters such as temperature and maxTokenCount are optimized to balance response thoroughness and relevancy.
- Bedrock then generates an enhanced response, adding additional clarity, context, and suggestions that make the information suitable for healthcare decision-making.

![Bedrock Configuration](/Saumils-blog/images/gen-ai-healthcare/step5.png)

### 3. Python Application

```python
import boto3
import json

# AWS region setup
region_name = 'us-east-1'

# Initialize Kendra client
kendra = boto3.client('kendra', region_name=region_name)
index_id = 'kendra-index-id-here'
query = "what are the warning signs for DKA? "

# Initialize Bedrock client
boto3_bedrock = boto3.client('bedrock-runtime', region_name=region_name)

# Function to invoke Bedrock for enhanced response
def get_bedrock_enhanced_response(human_input, context_string):
    prompt_data = f"Here is some context:\\n\\n{context_string}\\n\\nHuman: {human_input}\\nAssistant:"
    
    body_part = json.dumps({
        'inputText': prompt_data,
        'textGenerationConfig': {
            'maxTokenCount': 4096,
            'stopSequences': [],
            'temperature': 0.7,
            'topP': 1.0
        }
    })

    # Invoke Bedrock model
    response = boto3_bedrock.invoke_model(
        body=body_part,
        contentType="application/json",
        accept="application/json",
        modelId='amazon.titan-text-lite-v1'
    )

    # Read and decode the StreamingBody before parsing
    response_body = response['body'].read().decode('utf-8')
    output_text = json.loads(response_body)['results'][0]['outputText']
    return output_text

# Kendra query processing
response = kendra.query(QueryText=query, IndexId=index_id)

# Process Kendra query results
for query_result in response['ResultItems']:
    begin = 0
    end = 0
    if query_result['Type'] == 'ANSWER':
        answer = query_result['AdditionalAttributes'][0]['Value']['TextWithHighlightsValue']
        highlight = answer['Highlights']
        for obj in highlight:
            if obj['TopAnswer'] is True:
                begin = obj['BeginOffset']
                end = obj['EndOffset']
        
        # Get the answer text
        if end == 0:
            answer_text = answer['Text']
        else:
            answer_text = answer['Text'][begin:end]

        print("Kendra Answer: ", answer_text)

        # Now pass the Kendra response to Bedrock for enhancement
        enhanced_response = get_bedrock_enhanced_response(query, answer_text)
        print("\\nEnhanced response from Bedrock:\\n")
        print(enhanced_response)
```

## Use Case Example

A practical use case for this solution is illustrated with a query about diabetic ketoacidosis (DKA), a critical condition requiring timely recognition:

1. **User Query**: A clinician asks, "What are the warning signs for DKA?"

2. **Kendra Response**: AWS Kendra retrieves a concise answer from document stored in S3, such as "DKA symptoms include excessive thirst, frequent urination, nausea, and fatigue."

![Kendra Query Response](/Saumils-blog/images/gen-ai-healthcare/step6.png)

3. **Enhanced Response via Bedrock**: Bedrock processes this response, adding further context, such as explaining symptoms in layperson's terms and suggesting next steps for patients. For instance, "Warning signs for DKA, a complication from high blood sugar, include extreme thirst, frequent urination, nausea, and fatigue. If these symptoms occur, patients should seek medical attention promptly to avoid severe complications."

![Bedrock Enhanced Response](/Saumils-blog/images/gen-ai-healthcare/step7.png)

This example demonstrates the combined power of Kendra and Bedrock to provide healthcare professionals with accurate, contextually enhanced answers that are easy to interpret for both patients and clinicians.

### Sample Output

![Sample Query Output](/Saumils-blog/images/gen-ai-healthcare/step8.png)

![Enhanced Output Example](/Saumils-blog/images/gen-ai-healthcare/step9.png)

## Results

The integration of AWS Kendra and Bedrock provides several key benefits for healthcare clients:

- **Enhanced Information Relevance**: Kendra's retrieval of information ensures answers are precise and sourced from credible healthcare documents from S3.
- **Clarity and Contextual Depth**: Bedrock's generative capabilities add context to complex medical terms, making information accessible and understandable.
- **Efficiency and Time Savings**: The solution minimizes the time clinicians spend searching for answers, supporting quicker decision-making and patient interactions.

These outcomes improve the quality of healthcare information retrieval, ensuring that professionals and patients alike receive actionable, high-quality responses.

## Conclusion

This AWS Kendra and Bedrock solution demonstrates a robust use case for healthcare clients seeking reliable, context-rich information to enhance clinical decision-making and patient care. With Kendra's precision search capabilities and Bedrock's advanced language generation, the architecture provides accurate, well-rounded responses tailored to healthcare needs. This solution is highly scalable, adaptable, and effective for various healthcare applications, making it a valuable tool in the evolving landscape of healthcare information technology.
