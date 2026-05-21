import base64

from app.config import get_settings

settings = get_settings()


async def get_advice(question: str, crop_type: str | None, language: str, context: dict | None = None) -> str:
    lang_names = {"uz": "O'zbek", "ru": "Русский", "en": "English"}
    lang = lang_names.get(language, "O'zbek")
    crop = crop_type or "umumiy ekin"

    if settings.anthropic_api_key:
        try:
            import anthropic

            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            ctx = f"\nKontekst: {context}" if context else ""
            msg = client.messages.create(
                model="claude-3-5-haiku-20241022",
                max_tokens=800,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f"Siz AgroSat UZ qishloq xo'jaligi maslahatchisisiz. "
                            f"Til: {lang}. Ekin: {crop}. Savol: {question}{ctx}"
                        ),
                    }
                ],
            )
            block = msg.content[0]
            if hasattr(block, "text"):
                return block.text
        except Exception:
            pass

    return _fallback_advice(question, crop, language)


async def analyze_disease(
    crop_type: str, symptoms: str, language: str, image_b64: str | None = None
) -> dict:
    if settings.anthropic_api_key and image_b64:
        try:
            import anthropic

            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            media_type = "image/jpeg"
            msg = client.messages.create(
                model="claude-3-5-haiku-20241022",
                max_tokens=900,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": media_type,
                                    "data": image_b64,
                                },
                            },
                            {
                                "type": "text",
                                "text": (
                                    f"AgroSat: {crop_type} kasalligi tahlili. "
                                    f"Alomatlar: {symptoms}. Til: {language}. "
                                    "JSON: diagnosis, severity, chemical_treatment, organic_treatment, prevention"
                                ),
                            },
                        ],
                    }
                ],
            )
            block = msg.content[0]
            if hasattr(block, "text"):
                return {"analysis": block.text, "ai_powered": True}
        except Exception:
            pass

    return {
        "diagnosis": "Ehtimoliy zamburug' yoki namlik stressi",
        "severity": "moderate",
        "chemical_treatment": "Baktritsid yoki mis preparatlari (etiketka bo'yicha)",
        "organic_treatment": "Sarimsoq purkash, zaytun moyi eritmasi",
        "prevention": "Sug'orishni kamaytiring, havo aylanishini yaxshilang",
        "ai_powered": False,
        "note": "ANTHROPIC_API_KEY qo'shilsa rasm tahlili yoqiladi",
    }


def _fallback_advice(question: str, crop: str, language: str) -> str:
    tips = {
        "uz": (
            f"🌾 {crop} bo'yicha maslahat:\n"
            f"Savolingiz: {question}\n\n"
            "• Ertalab yoki kechqurun sug'oring\n"
            "• NDVI pasaysa kasallikni tekshiring\n"
            "• Ob-havo yomg'irli bo'lsa sug'orishni kechiktiring"
        ),
        "ru": (
            f"🌾 Совет по {crop}:\n"
            f"Вопрос: {question}\n\n"
            "• Поливайте утром или вечером\n"
            "• При падении NDVI проверьте болезни\n"
            "• Отложите полив в дождливые дни"
        ),
        "en": (
            f"🌾 Advice for {crop}:\n"
            f"Question: {question}\n\n"
            "• Irrigate early morning or evening\n"
            "• If NDVI drops, check for disease\n"
            "• Skip irrigation on rainy days"
        ),
    }
    return tips.get(language, tips["uz"])
