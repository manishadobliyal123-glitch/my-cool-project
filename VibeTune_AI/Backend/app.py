import base64
import binascii
import colorsys
import io
import json
import os
from pathlib import Path
import sys
from urllib.parse import urlencode
from urllib.request import urlopen
import requests

# Reconfigure stdout and stderr to handle UTF-8 print outputs safely on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect, File, UploadFile, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from PIL import Image, ImageStat, ImageDraw, ImageFont, ImageFilter
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

SECRET_KEY = "vibetune_ai_super_secret_key_for_development"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: Optional[str] = ""

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


app = FastAPI(
    title="MAD Music Backend",
    description="API for the premium MAD Music streaming player dashboard",
    version="1.0.0"
)

# Enable CORS to allow requests from Vite frontend (typically http://localhost:5173 or other ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"[VALIDATION ERROR] Path: {request.url.path}")
    print(f"[VALIDATION ERROR] Method: {request.method}")
    print(f"[VALIDATION ERROR] Errors: {exc.errors()}")
    return JSONResponse(
        status_code=400,
        content={"detail": exc.errors()},
    )

# Song Metadata Schema
class Track(BaseModel):
    id: int
    title: str
    artist: str
    album: str
    genre: str
    duration: int  # in seconds
    cover_url: str
    audio_url: str
    lyrics: str
    is_favorite: bool = False

# Favorites Model
class FavoriteToggleRequest(BaseModel):
    track_id: int


class EmotionRequest(BaseModel):
    image: Optional[str] = None
    language: Optional[str] = "hindi"


class VoiceRequest(BaseModel):
    audio: Optional[str] = None
    volume_samples: Optional[List[float]] = None
    pitch_samples: Optional[List[float]] = None


class CoverRequest(BaseModel):
    title: str
    theme: str
    description: Optional[str] = ""


class PlaylistGenerationRequest(BaseModel):
    mood: Optional[str] = None
    weather: Optional[str] = None
    timeOfDay: Optional[str] = None
    voiceTone: Optional[str] = None
    faceEmotion: Optional[str] = None
    useHistory: Optional[bool] = False
    historyGenres: Optional[List[str]] = None
    language: Optional[str] = "hindi"



# Mock Database of beautiful royalty-free tracks
TRACKS_DATABASE = [
    {
        "id": 1,
        "title": "Midnight City Drive",
        "artist": "Synthwave Sunset",
        "album": "Retro Journeys",
        "genre": "Synthwave",
        "duration": 362,
        "cover_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "lyrics": "[00:00] (Instrumental Intro)\n[00:25] Cruising down the neon avenue...\n[00:45] The grid is flashing purple and blue...\n[01:10] Synthesizers start to rise, under pixelated skies...\n[01:40] Feel the rhythm of the drive, keeping retro dreams alive.\n[02:10] (Guitar Synth Solo)\n[03:00] Under the artificial glow, where the cyber rivers flow...\n[03:40] (Outro fading into the neon sunrise)",
        "is_favorite": True
    },
    {
        "id": 2,
        "title": "Lofi Raindrops",
        "artist": "Cozy Coffee Beats",
        "album": "Chill Study Beats",
        "genre": "Lofi Hip Hop",
        "duration": 423,
        "cover_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "lyrics": "[00:00] (Rain pattering on windowpane)\n[00:15] (Smooth electric piano chords fade in)\n[00:40] Warm coffee in my hands...\n[01:05] Watching droplets make their plans...\n[01:45] Notebook open on the desk, quiet mind and simple rest...\n[02:30] Just another rainy day, wash the heavy thoughts away.\n[03:15] (Soft saxophone interlude)\n[05:20] (Rain fades into static vinyl crackle)",
        "is_favorite": False
    },
    {
        "id": 3,
        "title": "Cyberpunk Sunrise",
        "artist": "Gridrunner",
        "album": "Neon Grid",
        "genre": "Retrowave",
        "duration": 344,
        "cover_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "lyrics": "[00:00] (Industrial pulse and ambient pads)\n[00:30] The code is loading in my head...\n[00:55] Forget what the system said...\n[01:25] We are the runners of the night, reaching for the cyber light...\n[02:00] Accelerate, don't look back, we are off the beaten track.\n[02:40] (Epic synth arpeggio climax)\n[03:20] Rising above the high-rise tower, feel the holographic power...\n[04:30] (Outro pulse)",
        "is_favorite": False
    },
    {
        "id": 4,
        "title": "Summer Horizon",
        "artist": "Daydreamers",
        "album": "Coastal Vibes",
        "genre": "Acoustic Pop",
        "duration": 302,
        "cover_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "lyrics": "[00:00] (Acoustic guitar strumming)\n[00:12] Sun is kissing on the shore, couldn't ask for any more...\n[00:30] Wind is dancing in your hair, we can drive to anywhere...\n[00:50] Oh, summer horizon, where the sea meets the sky...\n[01:10] Under the golden sun, our story has just begun.\n[01:40] (Light percussion joins)\n[02:10] Chasing shadows on the beach, everything is in our reach...\n[02:45] (Guitar and vocal harmonies chorus)\n[03:40] (Ocean waves sound effect outro)",
        "is_favorite": True
    },
    {
        "id": 5,
        "title": "Ethereal Dream",
        "artist": "Solitude",
        "album": "Ambient Space",
        "genre": "Ambient",
        "duration": 542,
        "cover_url": "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "lyrics": "[00:00] (Soft atmospheric drone)\n[01:00] Floating through the cosmic sea...\n[02:00] Quiet minds are setting free...\n[03:30] No words to speak, no tasks to bind...\n[04:45] Leave the busy world behind...\n[06:00] (Deep ambient wash of sound)\n[08:00] (Fades into absolute silence)",
        "is_favorite": False
    },
    {
        "id": 6,
        "title": "Neon Monsoon",
        "artist": "Cyber Rain",
        "album": "Monsoon Grid",
        "genre": "Retrowave",
        "duration": 298,
        "cover_url": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "lyrics": "[00:00] (Heavy bass synths and rain sound effects)\n[00:20] Static in the humid night...\n[00:45] Reflections in the neon light...\n[01:10] Rain is pouring on the glass, waiting for the storm to pass...\n[01:45] We ride the frequency of high tide...\n[02:30] Monsoons rising in the grid system...",
        "is_favorite": False
    },
    {
        "id": 7,
        "title": "Morning Dew",
        "artist": "Acoustic Breeze",
        "album": "Sunrise Sessions",
        "genre": "Acoustic Pop",
        "duration": 245,
        "cover_url": "https://images.unsplash.com/photo-1470252649358-969e64291999?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "lyrics": "[00:00] (Soft fingerstyle guitar intro)\n[00:15] Waking up before the sun is high...\n[00:35] Golden ribbons painting up the sky...\n[00:55] Dewdrops on the meadow grass...\n[01:25] Morning whispers, hours pass...",
        "is_favorite": False
    },
    {
        "id": 8,
        "title": "Stormy Nights",
        "artist": "Thunder & Beat",
        "album": "Electrified",
        "genre": "Synthwave",
        "duration": 320,
        "cover_url": "https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "lyrics": "[00:00] (Thunder rumble and arpeggiator start)\n[00:25] Lighting strikes across the plain...\n[00:50] Dancing in the heavy rain...\n[01:15] Charged with electricity, wild and full of energy...\n[02:00] No shelter from the electric storm!",
        "is_favorite": False
    },
    {
        "id": 9,
        "title": "Midnight Solitude",
        "artist": "Velvet Voice",
        "album": "Silent Waves",
        "genre": "Ambient",
        "duration": 480,
        "cover_url": "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "lyrics": "[00:00] (Deep ambient pads and gentle piano notes)\n[01:00] Walking in the starlight cold...\n[02:00] Stories that were never told...\n[03:30] Just the echo of the midnight breeze...\n[05:00] Rest in velvet, feel at ease...",
        "is_favorite": False
    },
    {
        "id": 10,
        "title": "Golden Hour",
        "artist": "Lofi Horizon",
        "album": "Sunset Lounge",
        "genre": "Lofi Hip Hop",
        "duration": 275,
        "cover_url": "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        "lyrics": "[00:00] (Vinyl crackle and warm electric guitar chords)\n[00:20] Watching shadows stretch and grow...\n[00:50] Everything in golden glow...\n[01:30] Chill vibrations, sipping tea...\n[02:10] Perfectly at peace with me...",
        "is_favorite": False
    },
    {
        "id": 11,
        "title": "Pixel Paradise",
        "artist": "Arcade Adventure",
        "album": "Chiptune Dreams",
        "genre": "Retrowave",
        "duration": 312,
        "cover_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        "lyrics": "[00:00] (8-bit bleeps and high energy synth beat)\n[00:15] Level up and start the quest...\n[00:35] High-score dreams, we are the best...\n[01:00] Jumping pixels, shining bright...\n[01:30] Arcade action through the night!",
        "is_favorite": False
    },
    {
        "id": 12,
        "title": "Echoes of Silence",
        "artist": "Deep Chill",
        "album": "Subzero Vibes",
        "genre": "Ambient",
        "duration": 510,
        "cover_url": "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        "lyrics": "[00:00] (Glacial synth pads, snowy ambient sounds)\n[01:10] Snowflakes landing on the ground...\n[02:20] Not a single heavy sound...\n[03:40] Glacial echoes far away...\n[05:00] Peaceful chillness here to stay...",
        "is_favorite": False
    },
    {
        "id": 13,
        "title": "Autumn Wind",
        "artist": "Folk & Feather",
        "album": "Leaves Falling",
        "genre": "Acoustic Pop",
        "duration": 288,
        "cover_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        "lyrics": "[00:00] (Warm acoustic guitar and violin intro)\n[00:15] Leaves are dancing in the breeze...\n[00:35] Swirling down from ancient trees...\n[01:00] Autumn colors, red and gold...\n[01:30] Tales of seasons growing old...",
        "is_favorite": False
    },
    {
        "id": 14,
        "title": "Hyperdrive Rush",
        "artist": "Neon Strike",
        "album": "Veloctiy Zero",
        "genre": "Synthwave",
        "duration": 334,
        "cover_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        "lyrics": "[00:00] (Heavy fast synth bass, fast drums)\n[00:20] Adrenaline is building high...\n[00:40] Burning red across the sky...\n[01:00] Shift gears, hit the nitro blast...\n[01:30] Run the race and finish last? Never!",
        "is_favorite": False
    },
    {
        "id": 15,
        "title": "Chamber of Dreams",
        "artist": "Slumber Beats",
        "album": "Restful Sleep",
        "genre": "Lofi Hip Hop",
        "duration": 415,
        "cover_url": "https://images.unsplash.com/photo-1511289081367-347539165ab5?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        "lyrics": "[00:00] (Vinyl crackle, slow keyboard progression, deep breathing)\n[00:30] Close your eyes and drift away...\n[01:10] Put to sleep the busy day...\n[02:00] Float on clouds of lofi sound...\n[03:00] Peace is what you finally found...",
        "is_favorite": False
    },
    {
        "id": 16,
        "title": "Kesariya (Lofi Vibe)",
        "artist": "Arijit Singh & Cozy Lofi",
        "album": "Bollywood Chillouts",
        "genre": "Bollywood Lofi",
        "duration": 222,
        "cover_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "lyrics": "[00:00] (Warm Bollywood sitar lofi chords)\n[00:15] Mujhko mila hai tera silsila...\n[00:35] Kesariya tera ishq hai piya...\n[00:55] Rang jaaun jo main haath lagaaun...\n[01:25] Din beete saare teri fikr mein...\n[01:55] Rain saari teri khair manaaye...",
        "is_favorite": False
    },
    {
        "id": 17,
        "title": "Tum Hi Ho (Acoustic)",
        "artist": "Arijit Singh",
        "album": "Aashiqui Unplugged",
        "genre": "Bollywood Romantic",
        "duration": 284,
        "cover_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "lyrics": "[00:00] (Soft piano keys fading in)\n[00:12] Hum tere bin ab reh nahi sakte...\n[00:25] Tere bina kya wajood mera...\n[00:45] Kyunki tum hi ho, ab tum hi ho...\n[01:05] Zindagi ab tum hi ho...\n[01:30] Chain bhi, mera dard bhi...\n[01:55] Meri aashiqui ab tum hi ho...",
        "is_favorite": False
    },
    {
        "id": 18,
        "title": "Chaiyya Chaiyya (Retro Beats)",
        "artist": "A.R. Rahman & Sukhwinder Singh",
        "album": "Dil Se Classics",
        "genre": "Bollywood Classic",
        "duration": 340,
        "cover_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "lyrics": "[00:00] (Energetic Indian drums and train rhythm)\n[00:15] Jinke sar ho ishq ki chhaaon...\n[00:30] Chal chhaiyya chhaiyya chhaiyya chhaiyya...\n[00:45] Chal chhaiyya chhaiyya chhaiyya chhaiyya...\n[01:10] Saare ishq ki chhaaon chal chhaiyya chhaiyya...\n[01:40] (High energy dhol solo)",
        "is_favorite": False
    },
    {
        "id": 19,
        "title": "Kabira (Sunset Mix)",
        "artist": "Tochi Raina & Rekha Bhardwaj",
        "album": "Yeh Jawaani Remixed",
        "genre": "Bollywood Folk",
        "duration": 251,
        "cover_url": "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "lyrics": "[00:00] (Acoustic guitar and sarangi backdrop)\n[00:14] Kaisi teri khudgarzi...\n[00:28] Na dhoop chune na chhaaon...\n[00:42] Ban liya apna paigambar...\n[01:00] Re Kabira maan jaa, re Kabira maan jaa...\n[01:25] Aaja tujhko pukaarein teri parchhaiyaan...",
        "is_favorite": False
    },
    {
        "id": 20,
        "title": "Kun Faya Kun (Ethereal Sufi)",
        "artist": "A.R. Rahman & Javed Ali",
        "album": "Rockstar Sufi",
        "genre": "Sufi Ambient",
        "duration": 482,
        "cover_url": "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "lyrics": "[00:00] (Mystical ambient drone with harmonium)\n[00:40] Ya rabbal aalameen...\n[01:10] Kun faya kun, kun faya kun...\n[01:40] Jab kahin pe kuch nahi tha...\n[02:10] Wahi tha wahi tha wahi tha...\n[02:50] Mann ke is andhere kamre mein...",
        "is_favorite": False
    },
    {
        "id": 21,
        "title": "Dil Diyan Gallan",
        "artist": "Atif Aslam",
        "album": "Romantic Blockbusters",
        "genre": "Bollywood Romantic",
        "duration": 260,
        "cover_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "lyrics": "[00:00] (Soft guitar plucking and strings)\n[00:15] Kacchi doriyon, doriyon se...\n[00:30] Tu na todiyo, todiyo se...\n[00:45] Dil diyan gallan, karange naal naal beh ke...\n[01:10] Akh naale akh nu mila ke...\n[01:40] (Beautiful instrumental hook)",
        "is_favorite": False
    },
    {
        "id": 22,
        "title": "Kar Gayi Chull (Club Mix)",
        "artist": "Badshah & Neha Kakkar",
        "album": "Bollywood Party Anthem",
        "genre": "Bollywood Dance",
        "duration": 188,
        "cover_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "lyrics": "[00:00] (Upbeat electronic party drums and bass)\n[00:10] Arey ladki beautiful, kar gayi chull...\n[00:22] Chull chull, kar gayi chull...\n[00:35] Dekh tera rang saawla hua baawla...\n[00:50] Ladki beautiful, kar gayi chull...\n[01:10] (Rap verse by Badshah)",
        "is_favorite": False
    },
    {
        "id": 23,
        "title": "Zingaat (High Energy)",
        "artist": "Ajay-Atul",
        "album": "Dhadak Grooves",
        "genre": "High Energy Dance",
        "duration": 226,
        "cover_url": "https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "lyrics": "[00:00] (Fast paced traditional dhol and brass)\n[00:12] Naad ekach jhaala, Zingaat!\n[00:25] Zing zing zing zing zingaat...\n[00:40] Zing zing zing zing zingaat...\n[01:00] Aata udayla paaye, Zingaat!\n[01:30] (Intense dhol and dance beats climax)",
        "is_favorite": False
    },
    {
        "id": 24,
        "title": "Raatan Lambiyan",
        "artist": "Jubin Nautiyal & Asees Kaur",
        "album": "Shershaah Love",
        "genre": "Bollywood Romantic",
        "duration": 230,
        "cover_url": "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "lyrics": "[00:00] (Warm guitar and flute introduction)\n[00:12] Teri meri baaton ne toh...\n[00:25] Kaata hai safar yeh hasi...\n[00:40] Kaatna re raatan lambiyan lambiyan re...\n[01:00] Ghar aaja maahi, aaja maahi re...\n[01:25] Raatan lambiyan lambiyan re...",
        "is_favorite": False
    },
    {
        "id": 25,
        "title": "Pasoori (Lofi Beat)",
        "artist": "Ali Sethi & Shae Gill",
        "album": "Indie Pop Sessions",
        "genre": "Indie Pop",
        "duration": 218,
        "cover_url": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        "lyrics": "[00:00] (Groovy bass guitar and harmonium beats)\n[00:10] Agg laawan majboori nu...\n[00:20] Aaan jaan di pasoori nu...\n[00:35] Mere dhol judaiyaan di ab khabar kivein hove...\n[00:50] Aaja mere dholna, aaja mere dholna...\n[01:10] Poori ho vi jaave doori...",
        "is_favorite": False
    },
    {
        "id": 26,
        "title": "Tujhe Kitna Chahne Lage",
        "artist": "Arijit Singh",
        "album": "Kabir Singh Ballads",
        "genre": "Bollywood Romantic",
        "duration": 265,
        "cover_url": "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        "lyrics": "[00:00] (Guitar-driven slow pop beat)\n[00:15] Dil ka dariya beh hi gaya...\n[00:30] Ishq ibaadat ban hi gaya...\n[00:45] Tujhe kitna chahne lage hum...\n[01:10] Tere bin ab na lenge ek bhi dam...\n[01:40] Tujhe kitna chahne lage hum...",
        "is_favorite": False
    },
    {
        "id": 27,
        "title": "Galti Se Mistake",
        "artist": "Pritam & Arijit Singh",
        "album": "Jagga Jasoos Fun",
        "genre": "Bollywood Dance",
        "duration": 204,
        "cover_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        "lyrics": "[00:00] (Fun quirky sound effects and high tempo beat)\n[00:12] Jhatka ye lagne se thoda sa chhatka ye...\n[00:24] Galti se mistake ho gaya...\n[00:36] Arey ho gaya, arey galti se mistake ho gaya...\n[00:50] (Playful brass horn section)",
        "is_favorite": False
    },
    {
        "id": 28,
        "title": "Jeena Jeena (Unplugged)",
        "artist": "Atif Aslam",
        "album": "Acoustic Hits",
        "genre": "Acoustic Pop",
        "duration": 215,
        "cover_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        "lyrics": "[00:00] (Beautiful acoustic guitar picking)\n[00:12] Dehleez pe mere dil ki...\n[00:25] Jo rakhe hain tune kadam...\n[00:40] Tere naam pe meri zindagi...\n[01:00] Likh di mere humdum...\n[01:25] Jeena jeena kaise jeena tere bina...",
        "is_favorite": False
    },
    {
        "id": 29,
        "title": "Senorita (Latin Bollywood)",
        "artist": "Farhan Akhtar & Hrithik Roshan",
        "album": "ZNMD Fun Beats",
        "genre": "Bollywood Dance",
        "duration": 235,
        "cover_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        "lyrics": "[00:00] (Flamenco guitar and clapping rhythms)\n[00:12] Kiske dil mein hai kya, Senorita...\n[00:25] Suno suno mere dil ki baat, Senorita...\n[00:40] Jab jab aayi aisi raat, Senorita...\n[00:55] Haath mein leke tera haath, Senorita...\n[01:20] (Spanish vocal interlude)",
        "is_favorite": False
    },
    {
        "id": 30,
        "title": "Bulleya (Intense Sufi Rock)",
        "artist": "Amit Mishra & Shilpa Rao",
        "album": "Ae Dil Sufi Hits",
        "genre": "Bollywood Rock",
        "duration": 348,
        "cover_url": "https://images.unsplash.com/photo-1511289081367-347539165ab5?w=500&auto=format&fit=crop&q=60",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        "lyrics": "[00:00] (Heavy rock guitar electric chords)\n[00:20] Meri rooh ka parinda phadphadaye...\n[00:35] Lekin sukoon ka jazeera mil na paaye...\n[00:50] Toh Rumi kya bole, Bulleya kya bole...\n[01:10] Tu hi toh Bulleya, mera Bulleya...\n[01:40] (Powerful electric guitar solo chorus)",
        "is_favorite": False
    }
]

# State storage for user's favorite IDs (simulated persistent storage)
FAVORITES_SET = {track["id"] for track in TRACKS_DATABASE if track["is_favorite"]}



def read_env_value(env_path: Path, key: str) -> Optional[str]:
    if not env_path.exists():
        return None

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        name, value = line.split("=", 1)
        if name.strip() == key:
            return value.strip().strip("\"'")

    return None


def get_youtube_api_key() -> Optional[str]:
    env_key = os.getenv("YOUTUBE_API_KEY")
    if env_key:
        return env_key

    backend_env = Path(__file__).with_name(".env")
    frontend_env = Path(__file__).resolve().parents[1] / "Frontend" / "MNmusic" / ".env"
    return read_env_value(backend_env, "YOUTUBE_API_KEY") or read_env_value(
        frontend_env,
        "YOUTUBE_API_KEY",
    )

def get_db_tracks():
    # Sync favorites state with our simulated db
    tracks = []
    for t in TRACKS_DATABASE:
        t_copy = dict(t)
        t_copy["is_favorite"] = t["id"] in FAVORITES_SET
        tracks.append(Track(**t_copy))
    return tracks


def track_to_video_item(track: Track) -> Dict[str, Any]:
    video_id = f"mn-track-{track.id}"
    return {
        "id": {"videoId": video_id},
        "videoId": video_id,
        "snippet": {
            "title": track.title,
            "channelTitle": track.artist,
            "description": f"{track.album} - {track.genre}",
            "thumbnails": {
                "default": {"url": track.cover_url},
                "medium": {"url": track.cover_url},
                "high": {"url": track.cover_url},
            },
        },
        "track": track.model_dump(),
    }


def video_response(tracks: List[Track]) -> Dict[str, Any]:
    return {"items": [track_to_video_item(track) for track in tracks]}


def is_track_matching_language(title: str, channel: str, req_lang: str) -> bool:
    title_lower = title.lower()
    channel_lower = channel.lower()
    
    # Common Bollywood / Indian music channel and artist keywords
    hindi_keywords = [
        "t-series", "tseries", "zeemusic", "yash raj", "yrf", "sony music india", 
        "speed records", "geet mp3", "desimelodies", "diljit", "arijit", "badshah", 
        "neha kakkar", "jubin", "atif aslam", "shreya ghoshal", "sonu nigam", 
        "sukhwinder", "rahman", "amit mishra", "pritam", "mithoon", "lata mangeshkar",
        "kishore kumar", "rd burman", "bollywood", "hindi", "punjabi", "sufi", "ghazal",
        "kesariya", "kabira", "pasoori", "raatan", "zingaat", "chull", "dil diyan", 
        "tum hi ho", "chaiyya", "kun faya", "senorita", "bulleya", "dhadak", "shershaah",
        "tujhe kitna", "galti se", "mistake", "jeena jeena", "aashiqui", "dil se"
    ]
    
    has_hindi_keyword = any(k in title_lower or k in channel_lower for k in hindi_keywords)
    
    if req_lang == "hindi":
        # For Hindi, we want a high likelihood of it being Indian/Bollywood
        # If it has Hindi keywords or the query was already targeted at Bollywood, we accept it.
        # But let's filter out songs that look purely Western
        western_artists = ["taylor swift", "eminem", "drake", "ed sheeran", "coldplay", "justin bieber", "the weeknd", "ariana grande", "bruno mars", "billie eilish", "dua lipa", "post malone"]
        if any(wa in title_lower or wa in channel_lower for wa in western_artists):
            return False
        return True # Default to True since our search query for Hindi is extremely targeted
    else: # english / global
        # For English, we strictly want NO Hindi/Bollywood content
        if has_hindi_keyword:
            return False
        return True


def is_track_suitable(title: str, channel: str) -> bool:
    title_lower = title.lower()
    channel_lower = channel.lower()
    
    # Unwanted keywords indicating compilations, mashups, full albums, retro, or jukeboxes
    unwanted_keywords = [
        "jukebox", "compilation", "non-stop", "non stop", "full album", 
        "evergreen", "retro", "old songs", "purane gane", "90s hits", 
        "80s hits", "70s hits", "old is gold", "tribute", "mashup", 
        "unplugged compilation", "unplugged collection", "nonstop", "golden collection"
    ]
    
    if any(k in title_lower or k in channel_lower for k in unwanted_keywords):
        return False
    return True



def youtube_search(query: str, max_results: int = 10) -> Optional[Dict[str, Any]]:
    api_key = get_youtube_api_key()
    if not api_key:
        return None

    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "type": "video",
        "videoCategoryId": "10",
        "maxResults": max_results,
        "q": query,
        "key": api_key,
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()
    except Exception as error:
        print(f"YouTube API fallback for query {query!r}: {error}")
        return None

    return {"items": data.get("items", [])}


def decode_camera_image(data_url: str) -> Image.Image:
    if not data_url.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Expected a base64 data image.")

    try:
        _, encoded = data_url.split(",", 1)
        image_bytes = base64.b64decode(encoded, validate=True)
        image = Image.open(io.BytesIO(image_bytes))
        return image.convert("RGB")
    except (ValueError, binascii.Error, OSError) as error:
        raise HTTPException(status_code=400, detail="Invalid camera image data.") from error


def analyze_emotion_from_image(image: Image.Image) -> Dict[str, Any]:
    """Lightweight local mood estimate from webcam image color/lighting signals."""
    resized = image.resize((64, 64))
    stat = ImageStat.Stat(resized)
    red, green, blue = stat.mean
    brightness = (red + green + blue) / 3

    pixels = list(resized.getdata())
    hsv_values = [colorsys.rgb_to_hsv(r / 255, g / 255, b / 255) for r, g, b in pixels]
    avg_saturation = sum(s for _, s, _ in hsv_values) / len(hsv_values)
    avg_value = sum(v for _, _, v in hsv_values) / len(hsv_values)
    warm_pixels = sum(1 for h, s, v in hsv_values if (h <= 0.12 or h >= 0.92) and s > 0.18 and v > 0.18)
    cool_pixels = sum(1 for h, s, v in hsv_values if 0.48 <= h <= 0.72 and s > 0.15 and v > 0.15)
    warm_ratio = warm_pixels / len(hsv_values)
    cool_ratio = cool_pixels / len(hsv_values)

    red_dominance = (red - ((green + blue) / 2)) / 255
    blue_dominance = (blue - ((red + green) / 2)) / 255
    contrast = sum(stat.stddev) / 3

    green_to_red = green / red if red else 1

    if max(0, red_dominance) > 0.08 and avg_saturation > 0.22 and green_to_red < 0.58:
        emotion = "angry"
        confidence = 62 + (max(0, red_dominance) * 110) + (avg_saturation * 18)
    elif avg_value < 0.34 or cool_ratio > 0.22 or blue_dominance > 0.06:
        emotion = "sad"
        confidence = 58 + ((1 - avg_value) * 20) + (cool_ratio * 22) + (max(0, blue_dominance) * 70)
    elif avg_value > 0.48 and (warm_ratio > 0.08 or avg_saturation > 0.24):
        emotion = "happy"
        confidence = 56 + (avg_value * 16) + (warm_ratio * 28) + (avg_saturation * 16)
    else:
        emotion = "neutral"
        confidence = 54 + ((1 - abs(avg_value - 0.5)) * 14) + ((1 - avg_saturation) * 8)

    confidence = max(42, min(92, confidence))

    return {
        "emotion": emotion,
        "confidence": round(confidence, 1),
        "features": {
            "brightness": round(brightness, 1),
            "saturation": round(avg_saturation, 3),
            "warm_ratio": round(warm_ratio, 3),
            "cool_ratio": round(cool_ratio, 3),
            "red_dominance": round(red_dominance, 3),
            "blue_dominance": round(blue_dominance, 3),
            "green_to_red": round(green_to_red, 3),
            "contrast": round(contrast, 1),
        },
    }


def music_query_for_emotion(emotion: str) -> str:
    return {
        "happy": "happy upbeat bollywood dance songs",
        "sad": "sad emotional hindi heartbreak songs",
        "angry": "high energy intense workout hindi songs",
        "neutral": "calm relaxing hindi chill songs",
    }.get(emotion, "calm relaxing hindi chill songs")


@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "MAD Music Backend",
        "routes": ["/trending", "/search", "/detect-emotion", "/api/tracks"],
    }


@app.get("/trending")
def get_trending_music():
    youtube_result = youtube_search("trending hindi music songs")
    if youtube_result is not None:
        return youtube_result

    return video_response(get_db_tracks())


@app.get("/search")
def search_videos(query: str = Query("", description="Search query used by the frontend")):
    tracks = get_db_tracks()
    query = query.strip().lower()

    if not query:
        youtube_result = youtube_search("trending music")
        return youtube_result if youtube_result is not None else video_response(tracks)

    youtube_result = youtube_search(f"{query} music")
    if youtube_result is not None:
        return youtube_result

    results = [
        track
        for track in tracks
        if (
            query in track.title.lower()
            or query in track.artist.lower()
            or query in track.album.lower()
            or query in track.genre.lower()
        )
    ]
    return video_response(results)


@app.post("/detect-emotion")
def detect_emotion(request: EmotionRequest):
    if not request.image:
        raise HTTPException(status_code=400, detail="Camera image is required for emotion detection.")

    image = decode_camera_image(request.image)
    analysis = analyze_emotion_from_image(image)
    detected_emotion = analysis["emotion"]
    req_lang = (request.language or "hindi").lower()

    tracks = get_db_tracks()
    fallback_order = {
        "happy": ["Acoustic Pop", "Synthwave", "Retrowave"],
        "sad": ["Lofi Hip Hop", "Ambient", "Acoustic Pop"],
        "angry": ["Retrowave", "Synthwave", "Lofi Hip Hop"],
        "neutral": ["Ambient", "Lofi Hip Hop", "Acoustic Pop"],
    }
    genres = fallback_order.get(detected_emotion, fallback_order["neutral"])
    recommended_tracks = []
    for genre in genres:
        recommended_tracks.extend(track for track in tracks if track.genre == genre)

    # Filter local tracks strictly by language!
    if req_lang == "hindi":
        recommended_tracks = [t for t in recommended_tracks if t.id >= 16]
        if not recommended_tracks:
            recommended_tracks = [t for t in tracks if t.id >= 16]
    else:
        recommended_tracks = [t for t in recommended_tracks if t.id < 16]
        if not recommended_tracks:
            recommended_tracks = [t for t in tracks if t.id < 16]

    music_query = music_query_for_emotion(detected_emotion)
    if req_lang == "hindi":
        music_query = f"{music_query} bollywood hindi latest"
    else:
        music_query = f"{music_query} english global pop"
        
    youtube_result = youtube_search(music_query, max_results=10)
    
    # Filter YouTube results strictly by language!
    if youtube_result and youtube_result.get("items"):
        filtered_items = []
        for item in youtube_result["items"]:
            title = item["snippet"]["title"]
            channel = item["snippet"]["channelTitle"]
            if is_track_matching_language(title, channel, req_lang) and is_track_suitable(title, channel):
                # Inject a simulated track
                vid_id = item["id"]["videoId"]
                mock_t = {
                    "id": abs(hash(vid_id)) % 1000000,
                    "title": title,
                    "artist": channel,
                    "album": f"AI Face Curation ({req_lang.capitalize()})",
                    "genre": genres[0] if genres else "Pop",
                    "duration": 220,
                    "cover_url": item["snippet"]["thumbnails"]["medium"]["url"],
                    "audio_url": "",
                    "lyrics": "[00:00] (Instrumental face scan match)",
                    "is_favorite": False
                }
                item_copy = dict(item)
                item_copy["track"] = mock_t
                filtered_items.append(item_copy)
        youtube_result["items"] = filtered_items[:5] # Return top 5 matching

    # Prepare fallback Response if YouTube fails
    if not youtube_result or not youtube_result.get("items"):
        youtube_result = video_response(recommended_tracks[:5])

    return {
        "emotion": detected_emotion,
        "face_detected": True,
        "confidence": analysis["confidence"],
        "model": "local-image-mood-v1",
        "message": f"Detected {detected_emotion} mood from the camera image.",
        "features": analysis["features"],
        "music_query": music_query,
        "music": youtube_result,
    }

@app.get("/api/tracks", response_model=List[Track])
def get_tracks(genre: Optional[str] = None):
    tracks = get_db_tracks()
    if genre:
        tracks = [t for t in tracks if t.genre.lower() == genre.lower()]
    return tracks

@app.get("/api/tracks/{track_id}", response_model=Track)
def get_track(track_id: int):
    tracks = get_db_tracks()
    for t in tracks:
        if t.id == track_id:
            return t
    raise HTTPException(status_code=404, detail="Track not found")

@app.get("/api/albums")
def get_albums():
    tracks = get_db_tracks()
    albums = {}
    for t in tracks:
        if t.album not in albums:
            albums[t.album] = {
                "name": t.album,
                "artist": t.artist,
                "cover_url": t.cover_url,
                "genre": t.genre,
                "tracks_count": 0
            }
        albums[t.album]["tracks_count"] += 1
    return list(albums.values())

@app.get("/api/search", response_model=List[Track])
def search_tracks(q: str = Query(..., description="Query string to search in titles, artists, albums, or genres")):
    tracks = get_db_tracks()
    q_low = q.lower()
    results = []
    for t in tracks:
        if (q_low in t.title.lower() or 
            q_low in t.artist.lower() or 
            q_low in t.album.lower() or 
            q_low in t.genre.lower()):
            results.append(t)
    return results

@app.get("/api/playlists/favorites", response_model=List[Track])
def get_favorite_tracks():
    tracks = get_db_tracks()
    return [t for t in tracks if t.is_favorite]

@app.post("/api/playlists/favorites")
def toggle_favorite(request: FavoriteToggleRequest):
    track_exists = any(t["id"] == request.track_id for t in TRACKS_DATABASE)
    if not track_exists:
        raise HTTPException(status_code=404, detail="Track not found")
    
    if request.track_id in FAVORITES_SET:
        FAVORITES_SET.remove(request.track_id)
        status = "removed"
    else:
        FAVORITES_SET.add(request.track_id)
        status = "added"
        
    return {"status": "success", "action": status, "track_id": request.track_id}

@app.post("/api/analyze-voice")
def analyze_voice(request: VoiceRequest):
    # Real-time voice tone computation
    volume_samples = request.volume_samples or []
    pitch_samples = request.pitch_samples or []
    
    # Default fallback metrics
    avg_vol = sum(volume_samples) / len(volume_samples) if volume_samples else 0.5
    avg_pitch = sum(pitch_samples) / len(pitch_samples) if pitch_samples else 180.0
    
    vol_variance = 0.0
    if volume_samples:
        vol_variance = sum((x - avg_vol) ** 2 for x in volume_samples) / len(volume_samples)
        
    pitch_variance = 0.0
    if pitch_samples:
        pitch_variance = sum((x - avg_pitch) ** 2 for x in pitch_samples) / len(pitch_samples)
        
    # Tone logic
    if avg_pitch > 210 and avg_vol > 0.55:
        tone = "Excited"
        confidence = 75.0 + min(20.0, (avg_pitch - 210) * 0.1)
        description = "High energy and vibrant voice tone, indicating excitement or joy."
        matched_mood = "happy"
    elif avg_vol < 0.28 and avg_pitch < 155:
        tone = "Melancholic"
        confidence = 70.0 + (0.28 - avg_vol) * 80
        description = "Soft, lower-frequency speech, reflecting thoughtful or melancholic emotion."
        matched_mood = "sad"
    elif avg_vol > 0.65 and vol_variance > 0.05:
        tone = "Tense"
        confidence = 68.0 + vol_variance * 100
        description = "Aggressive or fluctuating volume dynamics, indicating tension or stress."
        matched_mood = "angry"
    else:
        tone = "Calm"
        confidence = 80.0 - pitch_variance * 0.05
        description = "Gentle, stable vocal frequency and steady volume, reflecting high calmness."
        matched_mood = "neutral"
        
    confidence = max(45.0, min(95.0, confidence))
    
    return {
        "status": "success",
        "tone": tone,
        "confidence": round(confidence, 1),
        "description": description,
        "matched_mood": matched_mood,
        "metrics": {
            "avg_volume": round(avg_vol, 3),
            "avg_pitch": round(avg_pitch, 1),
            "vol_variance": round(vol_variance, 4)
        }
    }


@app.post("/api/voice-speech-mood")
async def voice_speech_mood(file: UploadFile = File(...), language: str = Query("hindi")):
    # 1. Save uploaded file content to temporary memory
    try:
        content = await file.read()
        filename = file.filename or "recording.webm"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read audio file: {str(e)}")

    # 2. Call Groq Whisper API for speech-to-text
    groq_api_key = "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"
    transcribe_url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {groq_api_key}"}
    
    files = {
        "file": (filename, content, file.content_type or "audio/webm")
    }
    data = {
        "model": "whisper-large-v3",
        "response_format": "json"
    }
    
    try:
        response = requests.post(transcribe_url, headers=headers, files=files, data=data, timeout=20)
        response.raise_for_status()
        transcription_result = response.json()
        transcription_text = transcription_result.get("text", "").strip()
    except Exception as e:
        try:
            print(f"Groq Whisper transcription failed: {e}")
        except Exception:
            pass
        try:
            print("Response details:", response.text)
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=f"Speech transcription failed: {str(e)}")

    if not transcription_text:
        raise HTTPException(status_code=400, detail="Could not transcribe any speech from the audio file.")

    # 3. Call Groq LLM (llama-3.3-70b-versatile) for sentiment/emotion analysis
    completion_url = "https://api.groq.com/openai/v1/chat/completions"
    headers_completion = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json"
    }
    
    system_prompt = (
        "You are an expert AI musical mood analyst inside 'MAD Music'. "
        "Analyze the emotion, energy level, and mood of the user's spoken words transcription. "
        "You must respond with a strictly valid JSON object containing exactly these fields (do not wrap in markdown ```json or include extra text, just raw JSON):\n"
        "{\n"
        "  \"sentiment\": \"string (positive, negative, or neutral)\",\n"
        "  \"emotion\": \"string (e.g. Happy, Sad, Tired, Angry, Calm, Excited, Relaxed)\",\n"
        "  \"energy_level\": \"string (Low, Medium, or High)\",\n"
        "  \"mood\": \"string (a short 1-sentence description of the user's spoken vibe)\",\n"
        "  \"recommended_genres\": [\"list of 1 to 3 strings representing genres from this list: Synthwave, Retrowave, Lofi Hip Hop, Acoustic Pop, Ambient, Bollywood Dance, Bollywood Romantic, Bollywood Rock, Sufi Ambient\"],\n"
        "  \"explanation\": \"string (a short 1-sentence explanation of why you recommended these genres for this state)\"\n"
        "}"
    )
    
    user_prompt = f"The user spoke: \"{transcription_text}\""
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }
    
    try:
        completion_res = requests.post(completion_url, headers=headers_completion, json=payload, timeout=20)
        completion_res.raise_for_status()
        completion_data = completion_res.json()
        analysis_content = completion_data["choices"][0]["message"]["content"]
        analysis = json.loads(analysis_content)
    except Exception as e:
        try:
            print(f"Groq LLM analysis failed: {e}")
        except Exception:
            pass
        try:
            print("Response details:", completion_res.text)
        except Exception:
            pass
        analysis = {
            "sentiment": "neutral",
            "emotion": "Neutral",
            "energy_level": "Medium",
            "mood": "Calm and steady vibe.",
            "recommended_genres": ["Lofi Hip Hop", "Ambient"],
            "explanation": "Acoustic fallback due to transient server issues."
        }

    # 4. Map Recommended Genres to tracks in TRACKS_DATABASE or dynamic search
    recommended_genres = analysis.get("recommended_genres", ["Lofi Hip Hop"])
    primary_genre = recommended_genres[0] if recommended_genres else "Lofi"
    emotion = analysis.get("emotion", "Calm")
    
    # We query YouTube using "{emotion} {primary_genre} songs" with strict language queries
    if language == "hindi":
        youtube_query = f"{emotion} {primary_genre} hindi bollywood songs"
    else:
        youtube_query = f"{emotion} {primary_genre} english global pop songs"
        
    try:
        print(f"Speech Mood AI querying YouTube for: {youtube_query}")
    except Exception:
        pass
    
    youtube_res = youtube_search(youtube_query, max_results=10)
    youtube_items = None
    if youtube_res and youtube_res.get("items"):
        youtube_items = youtube_res["items"]
        
    recommended_tracks = []
    if youtube_items:
        for item in youtube_items:
            if len(recommended_tracks) >= 8:
                break
            vid_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            channel = item["snippet"]["channelTitle"]
            
            # Strict language and suitability check
            if not is_track_matching_language(title, channel, language) or not is_track_suitable(title, channel):
                continue
                
            mock_t = {
                "id": abs(hash(vid_id)) % 1000000,
                "title": title,
                "artist": channel,
                "album": f"AI Speech Curation ({language.capitalize()})",
                "genre": primary_genre,
                "duration": 200 + (abs(hash(vid_id)) % 100),
                "cover_url": item["snippet"]["thumbnails"]["medium"]["url"],
                "audio_url": "",
                "lyrics": f"[00:00] (Instrumental Speech Sync)\n[00:15] Curated for {emotion} emotion...\n[00:45] Based on speech input: '{transcription_text}'",
                "is_favorite": False
            }
            item_copy = dict(item)
            item_copy["track"] = mock_t
            recommended_tracks.append(item_copy)
            
    # Fill remaining slots up to 8 tracks with local curated tracks of matching language
    if len(recommended_tracks) < 8:
        tracks = get_db_tracks()
        matched = []
        for g in recommended_genres:
            matched.extend([t for t in tracks if t.genre.lower() == g.lower()])
            
        if language == "hindi":
            matched = [t for t in matched if t.id >= 16]
            if not matched:
                matched = [t for t in tracks if t.id >= 16]
        else:
            matched = [t for t in matched if t.id < 16]
            if not matched:
                matched = [t for t in tracks if t.id < 16]
                
        for t in matched:
            already_in = False
            for item in recommended_tracks:
                if item.get("track", {}).get("title") == t.title:
                    already_in = True
                    break
            if already_in:
                continue
            recommended_tracks.append(track_to_video_item(t))
            if len(recommended_tracks) >= 8:
                break

    return {
        "status": "success",
        "transcription": transcription_text,
        "sentiment": analysis.get("sentiment", "neutral"),
        "emotion": emotion,
        "energy_level": analysis.get("energy_level", "Medium"),
        "mood": analysis.get("mood", "Vibe analyzed by AI."),
        "explanation": analysis.get("explanation", ""),
        "recommended_genres": recommended_genres,
        "tracks": recommended_tracks
    }


@app.post("/api/recognize-song")
async def recognize_song(file: UploadFile = File(...)):
    # Voice Search / Voice Catcher: Transcribe spoken words and query YouTube
    try:
        content = await file.read()
        filename = file.filename or "recording.webm"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read audio file: {str(e)}")

    # 1. Call Groq Whisper API to transcribe speech
    groq_api_key = "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"
    transcribe_url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {groq_api_key}"}
    
    files = {
        "file": (filename, content, file.content_type or "audio/webm")
    }
    data = {
        "model": "whisper-large-v3",
        "response_format": "json"
    }
    
    try:
        response = requests.post(transcribe_url, headers=headers, files=files, data=data, timeout=20)
        response.raise_for_status()
        transcription_result = response.json()
        transcription_text = transcription_result.get("text", "").strip()
        try:
            print(f"Voice Identify Transcription: '{transcription_text}'")
        except Exception:
            pass
    except Exception as e:
        try:
            print(f"Groq Whisper transcription failed: {e}")
        except Exception:
            pass
        try:
            print("Response details:", response.text)
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=f"Voice transcription failed: {str(e)}")

    if not transcription_text:
        raise HTTPException(status_code=400, detail="Could not hear any speech. Try speaking louder.")

    # 2. Clean query text (strip out common leading spoken terms like "play", "search for", "find")
    query = transcription_text.strip(" .\"'?!")
    query_lower = query.lower()
    for phrase in ["play song", "play music", "play", "search for", "search", "find song", "find"]:
        if query_lower.startswith(phrase):
            query = query[len(phrase):].strip(" .\"'?!")
            break

    # 3. Query YouTube search with resolved query
    youtube_query = f"{query} music"
    youtube_res = youtube_search(youtube_query, max_results=1)
    
    matched_video = None
    song_name = query.capitalize()
    artist = "Voice Identified"
    album = "Voice Search"
    youtube_url = ""

    if youtube_res and youtube_res.get("items"):
        matched_video = youtube_res["items"][0]
        vid_id = matched_video["id"]["videoId"]
        
        title_snippet = matched_video["snippet"]["title"]
        channel_snippet = matched_video["snippet"]["channelTitle"]
        
        song_name = title_snippet
        artist = channel_snippet
        album = "YouTube Search"
        
        mock_t = {
            "id": abs(hash(vid_id)) % 1000000,
            "title": song_name,
            "artist": artist,
            "album": album,
            "genre": "Voice Identified",
            "duration": 240,
            "cover_url": matched_video["snippet"]["thumbnails"]["medium"]["url"],
            "audio_url": "",
            "lyrics": f"[00:00] (Instrumental Search Match)\n[00:15] Found via Voice Identify query: '{transcription_text}'",
            "is_favorite": False
        }
        matched_video["track"] = mock_t
        youtube_url = f"https://www.youtube.com/watch?v={vid_id}"

    return {
        "status": "success",
        "transcription": transcription_text,
        "title": song_name,
        "artist": artist,
        "album": album,
        "lyrics": f"[00:00] Playable Voice Search Match\n[00:10] Spoken input: \"{transcription_text}\"\n[00:20] Matched Video: {song_name}",
        "youtube_url": youtube_url,
        "video": matched_video
    }


@app.post("/api/generate-cover")
def generate_cover_art(request: CoverRequest):
    # Generates a premium cover art using PIL
    themes = {
        "neon": ((28, 10, 44), (161, 36, 255), (0, 243, 255)), # Dark deep, Neon Purple, Cyan
        "sunset": ((44, 12, 10), (255, 90, 95), (255, 202, 58)), # Dark Orange, Coral, Gold
        "ocean": ((5, 28, 44), (0, 119, 182), (72, 202, 228)), # Deep Blue, Royal, Light Blue
        "forest": ((8, 36, 18), (40, 116, 101), (196, 229, 56)), # Deep Green, Emerald, Lime
        "mono": ((15, 15, 15), (100, 100, 100), (240, 240, 240)), # Charcoal, Grey, White
        "love": ((44, 5, 15), (230, 57, 70), (255, 180, 180)), # Deep Rose, Red, Rose Gold
    }
    
    bg, c1, c2 = themes.get(request.theme.lower(), themes["neon"])
    
    # Create background image (500x500)
    img = Image.new("RGB", (500, 500), bg)
    
    # Draw two large blurred glowing circles for beautiful ambient design
    # Circle 1 (Accent 1)
    c1_img = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
    c1_draw = ImageDraw.Draw(c1_img)
    c1_draw.ellipse([50, 50, 350, 350], fill=(c1[0], c1[1], c1[2], 180))
    c1_img = c1_img.filter(ImageFilter.GaussianBlur(60))
    
    # Circle 2 (Accent 2)
    c2_img = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
    c2_draw = ImageDraw.Draw(c2_img)
    c2_draw.ellipse([150, 150, 450, 450], fill=(c2[0], c2[1], c2[2], 150))
    c2_img = c2_img.filter(ImageFilter.GaussianBlur(80))
    
    # Composite the glowing backgrounds
    img.paste(c1_img, (0, 0), c1_img)
    img.paste(c2_img, (0, 0), c2_img)
    
    # Draw a glassmorphic card overlay in the center
    card = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle([60, 60, 440, 440], radius=24, fill=(255, 255, 255, 18))
    card_draw.rounded_rectangle([60, 60, 440, 440], radius=24, outline=(255, 255, 255, 40), width=1)
    img.paste(card, (0, 0), card)
    
    # Draw decorative accent badge in the glass box
    badge = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge)
    badge_draw.rounded_rectangle([80, 80, 170, 102], radius=6, fill=(c2[0], c2[1], c2[2], 120))
    img.paste(badge, (0, 0), badge)
    
    # Draw Text
    draw = ImageDraw.Draw(img)
    
    # Load fonts
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 32)
        font_desc = ImageFont.truetype("arial.ttf", 16)
        font_badge = ImageFont.truetype("arialbd.ttf", 10)
    except IOError:
        font_title = ImageFont.load_default()
        font_desc = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        
    # Draw badge label
    draw.text((90, 85), "AI SOUNDS", fill=(255, 255, 255), font=font_badge)
    
    # Wrap title if too long
    words = request.title.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(" ".join(current_line)) > 15:
            lines.append(" ".join(current_line[:-1]))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
        
    title_wrapped = "\n".join(lines[:3])
    
    # Title text position
    draw.text((90, 130), title_wrapped, fill=(255, 255, 255), font=font_title)
    
    # Wrap and draw description
    desc_words = (request.description or "").split()
    desc_lines = []
    current_line = []
    for word in desc_words:
        current_line.append(word)
        if len(" ".join(current_line)) > 35:
            desc_lines.append(" ".join(current_line[:-1]))
            current_line = [word]
    if current_line:
        desc_lines.append(" ".join(current_line))
        
    desc_wrapped = "\n".join(desc_lines[:4])
    draw.text((90, 290), desc_wrapped, fill=(200, 200, 200), font=font_desc)
    
    # Save to memory stream and return base64
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG", quality=90)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "status": "success",
        "cover_url": f"data:image/jpeg;base64,{img_str}"
    }


@app.post("/api/generate-playlist")
def generate_playlist(request: PlaylistGenerationRequest):
    tracks = get_db_tracks()
    
    # Resolve the dominant inputs
    mood = (request.mood or "neutral").lower()
    weather = (request.weather or "sunny").lower()
    time_of_day = (request.timeOfDay or "afternoon").lower()
    voice_tone = (request.voiceTone or "Calm").lower()
    face_emotion = (request.faceEmotion or "neutral").lower()
    req_lang = (request.language or "hindi").lower()
    
    # Check if we should query YouTube dynamically
    youtube_items = None
    api_key = get_youtube_api_key()
    
    # Construct a high-fidelity query for YouTube
    if api_key:
        if req_lang == "hindi":
            mood_term = {
                "happy": "latest new hindi bollywood dance songs 2025 2026",
                "sad": "latest new sad emotional hindi songs 2025 2026",
                "angry": "latest new high energy bollywood motivational songs 2025 2026",
                "neutral": "latest new chill lofi hindi pop songs 2025 2026"
            }.get(mood, "latest new hindi songs 2025 2026")
            
            weather_term = {
                "sunny": "pleasant golden hour hits",
                "rainy": "monsoon rain romantic hits",
                "stormy": "heavy beat intense rock",
                "snowy": "soothing winter acoustic",
                "cloudy": "misty romantic slow"
            }.get(weather, "")
            
            youtube_query = f"{mood_term} {weather_term} latest new releases 2026"
        else:
            mood_term = {
                "happy": "latest new upbeat energetic dance pop tracks 2025 2026",
                "sad": "latest new melancholic sad pop songs 2025 2026",
                "angry": "latest new intense synthwave retrowave rock 2025 2026",
                "neutral": "latest new relaxing slow ambient chill lofi pop 2025 2026"
            }.get(mood, "latest new releases global hits 2025 2026")
            
            weather_term = {
                "sunny": "sunny afternoon pop",
                "rainy": "rainy day lofi chill",
                "stormy": "thunderstorm heavy synth",
                "snowy": "winter chill ambient",
                "cloudy": "overcast chill pop"
            }.get(weather, "")
            
            youtube_query = f"{mood_term} {weather_term} new release 2026"
            
        print(f"Querying YouTube API for: {youtube_query}")
        youtube_res = youtube_search(youtube_query, max_results=25)
        if youtube_res and youtube_res.get("items"):
            youtube_items = youtube_res["items"]
            
    # Score local tracks for curation
    scored_tracks = []
    for track in tracks:
        score = 0.0
        g = track.genre.lower()
        
        # Language preference STRICT Filtering
        is_hindi = track.id >= 16
        if req_lang == "hindi":
            if not is_hindi:
                continue
            score += 5.0
        else:  # english
            if is_hindi:
                continue
            score += 5.0
        
        # 1. Mood mapping
        if mood == "happy":
            if g in ["acoustic pop", "synthwave", "bollywood dance", "high energy dance"]: score += 0.8
            elif g in ["retrowave", "indie pop"]: score += 0.6
        elif mood == "sad":
            if g in ["ambient", "lofi hip hop", "bollywood lofi", "sufi ambient"]: score += 1.0
            elif g in ["acoustic pop", "bollywood romantic"]: score += 0.4
        elif mood == "angry":
            if g in ["synthwave", "retrowave", "bollywood rock", "high energy dance"]: score += 1.0
        elif mood in ["calm", "neutral"]:
            if g in ["ambient", "lofi hip hop", "bollywood lofi", "sufi ambient"]: score += 0.9
            elif g in ["acoustic pop", "bollywood romantic", "indie pop"]: score += 0.7
            
        # 2. Weather mapping
        if weather == "sunny":
            if "horizon" in track.title.lower() or "dew" in track.title.lower() or "kesariya" in track.title.lower(): score += 1.0
            elif g in ["acoustic pop", "retrowave", "bollywood dance", "indie pop"]: score += 0.6
        elif weather == "rainy":
            if "rain" in track.title.lower() or "monsoon" in track.title.lower() or "storm" in track.title.lower() or "raatan" in track.title.lower(): score += 1.2
            elif g in ["lofi hip hop", "ambient", "bollywood lofi", "sufi ambient"]: score += 0.6
        elif weather == "stormy":
            if "storm" in track.title.lower() or "hyperdrive" in track.title.lower() or "bulleya" in track.title.lower() or "zingaat" in track.title.lower(): score += 1.2
            elif g in ["synthwave", "retrowave", "bollywood rock", "high energy dance"]: score += 0.7
        elif weather == "snowy":
            if "silence" in track.title.lower() or "dream" in track.title.lower() or "jeena" in track.title.lower(): score += 1.0
            elif g in ["ambient", "lofi hip hop", "bollywood lofi", "sufi ambient"]: score += 0.6
        elif weather == "cloudy":
            if "wind" in track.title.lower() or "dew" in track.title.lower() or "kabira" in track.title.lower(): score += 0.9
            elif g in ["lofi hip hop", "acoustic pop", "ambient", "bollywood lofi", "indie pop"]: score += 0.5
            
        # 3. Time of Day mapping
        if time_of_day == "morning":
            if "dew" in track.title.lower() or "jeena" in track.title.lower(): score += 1.0
            elif g in ["acoustic pop", "ambient", "indie pop"]: score += 0.5
        elif time_of_day == "afternoon":
            if "horizon" in track.title.lower() or "paradise" in track.title.lower() or "senorita" in track.title.lower() or "chull" in track.title.lower(): score += 0.9
            elif g in ["acoustic pop", "retrowave", "synthwave", "bollywood dance"]: score += 0.6
        elif time_of_day == "evening":
            if "golden" in track.title.lower() or "wind" in track.title.lower() or "kabira" in track.title.lower() or "pasoori" in track.title.lower(): score += 1.0
            elif g in ["lofi hip hop", "acoustic pop", "bollywood romantic", "bollywood lofi"]: score += 0.6
        elif time_of_day in ["night", "midnight"]:
            if "midnight" in track.title.lower() or "solitude" in track.title.lower() or "chamber" in track.title.lower() or "kun faya kun" in track.title.lower(): score += 1.2
            elif g in ["synthwave", "lofi hip hop", "ambient", "bollywood lofi", "sufi ambient"]: score += 0.6
            
        # 4. Voice tone mapping
        if voice_tone == "excited":
            if g in ["synthwave", "retrowave", "bollywood dance", "high energy dance"]: score += 0.8
        elif voice_tone == "melancholic":
            if g in ["ambient", "lofi hip hop", "bollywood lofi", "sufi ambient"]: score += 0.9
        elif voice_tone == "tense":
            if g in ["synthwave", "retrowave", "bollywood rock", "high energy dance"]: score += 0.8
        elif voice_tone == "calm":
            if g in ["lofi hip hop", "ambient", "acoustic pop", "bollywood lofi", "sufi ambient"]: score += 0.8
            
        # 5. Face Emotion mapping
        if face_emotion == "happy":
            if g in ["acoustic pop", "synthwave", "bollywood dance", "high energy dance", "indie pop"]: score += 0.5
        elif face_emotion == "sad":
            if g in ["ambient", "lofi hip hop", "bollywood lofi", "sufi ambient", "bollywood romantic"]: score += 0.6
        elif face_emotion == "angry":
            if g in ["synthwave", "retrowave", "bollywood rock", "high energy dance"]: score += 0.6
            
        # 6. User History boost
        if request.useHistory and request.historyGenres:
            history_genres_lower = [hg.lower() for hg in request.historyGenres]
            if g in history_genres_lower:
                score += 0.4
                
        scored_tracks.append((score, track))
        
    # Sort and pick top 8 tracks
    scored_tracks.sort(key=lambda x: x[0], reverse=True)
    curated_tracks = [st[1] for st in scored_tracks[:8]]
    
    # Formulate playlist items (up to 8 tracks)
    playlist_items = []
    
    if youtube_items:
        for item in youtube_items:
            if len(playlist_items) >= 8:
                break
                
            vid_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            channel = item["snippet"]["channelTitle"]
            
            # Strict language filter
            if not is_track_matching_language(title, channel, req_lang):
                print(f"Skipping YouTube track not in language {req_lang}: {title} by {channel}")
                continue
                
            # Filter out compilation/jukebox/retro/mashup videos
            if not is_track_suitable(title, channel):
                print(f"Skipping unsuitable compilation/retro YouTube track: {title}")
                continue
                
            # Inject simulated track metadata so it works flawlessly on UI
            mock_t = {
                "id": abs(hash(vid_id)) % 1000000,
                "title": title,
                "artist": channel,
                "album": f"{req_lang.capitalize()} YouTube Sync",
                "genre": "Bollywood" if req_lang == "hindi" else "Global Pop",
                "duration": 220 + (abs(hash(vid_id)) % 90),
                "cover_url": item["snippet"]["thumbnails"]["medium"]["url"],
                "audio_url": "", # Client plays via YouTube iframe API
                "lyrics": "[00:00] (Instrumental sync)\n[00:15] Streaming cloud audio frequencies...\n[00:45] Matched and verified by AI studio...",
                "is_favorite": False
            }
            item_copy = dict(item)
            item_copy["track"] = mock_t
            playlist_items.append(item_copy)
            
    # Fill remaining slots up to 8 tracks with local curated tracks of matching language
    if len(playlist_items) < 8:
        for t in curated_tracks:
            # Check duplicate by title
            already_in = False
            for item in playlist_items:
                if item.get("track", {}).get("title") == t.title:
                    already_in = True
                    break
            if already_in:
                continue
            playlist_items.append(track_to_video_item(t))
            if len(playlist_items) >= 8:
                break

    # Get curated song title and artist
    song_title = "Curated Vibe"
    song_artist = "AI Artist"
    if playlist_items:
        first_item = playlist_items[0]
        if "track" in first_item:
            song_title = first_item["track"]["title"]
            song_artist = first_item["track"]["artist"]
        else:
            song_title = first_item.get("snippet", {}).get("title", "Curated Song")
            song_artist = first_item.get("snippet", {}).get("channelTitle", "AI Artist")

    # Clean title for beautiful cover art (remove parentheses and extra text)
    cover_title = song_title.split("(")[0].split("-")[0].strip()[:22]
    
    # 7. Generate a beautiful dynamic Title & Description for the single song
    title = f"{cover_title}"
    description = (
        f"A bespoke AI-curated {req_lang.capitalize()} playlist featuring '{song_title}' and others. "
        f"Synced with your {voice_tone.lower()} vocals, {face_emotion} face scan, and {weather} {time_of_day} weather profile."
    )
    
    # Auto-assign theme based on vibes
    theme = "neon"
    if mood == "sad" or weather == "rainy" or voice_tone.lower() == "melancholic":
        theme = "ocean"
    elif mood == "happy" or weather == "sunny" or voice_tone.lower() == "excited":
        theme = "sunset"
    elif mood == "angry" or weather == "stormy" or voice_tone.lower() == "tense":
        theme = "love"
    elif mood == "calm" or weather == "cloudy":
        theme = "forest"
        
    # Call cover art generation helper
    cover_request = CoverRequest(title=title, theme=theme, description=description)
    cover_res = generate_cover_art(cover_request)
    cover_url = cover_res["cover_url"]
        
    return {
        "status": "success",
        "playlist_id": f"ai-play-{abs(hash(title)) % 1000000}",
        "title": title,
        "description": description,
        "theme": theme,
        "cover_url": cover_url,
        "items": playlist_items
    }


# =====================================================================
# REAL-TIME COLLABORATIVE LISTENING ROOM: VIBESYNC
# =====================================================================
ACTIVE_VIBESYNC_ROOMS = {}

class VibeSyncManager:
    def __init__(self):
        # Maps room_code -> list of active WebSocket connections
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_rooms:
            self.active_rooms[room_code] = []
        self.active_rooms[room_code].append(websocket)

    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.active_rooms:
            if websocket in self.active_rooms[room_code]:
                self.active_rooms[room_code].remove(websocket)
            if not self.active_rooms[room_code]:
                del self.active_rooms[room_code]

    async def broadcast(self, room_code: str, payload: dict):
        if room_code in self.active_rooms:
            # Create a copy list to prevent concurrent modifications during broadcast
            sockets = list(self.active_rooms[room_code])
            for connection in sockets:
                try:
                    await connection.send_json(payload)
                except Exception as e:
                    print(f"Error broadcasting to VibeSync client: {e}")
                    self.disconnect(room_code, connection)

vibesync_manager = VibeSyncManager()

@app.websocket("/api/vibesync/{room_code}/{user_name}/{avatar_idx}")
async def vibesync_websocket_endpoint(websocket: WebSocket, room_code: str, user_name: str, avatar_idx: int):
    room_code = room_code.upper().strip()
    await vibesync_manager.connect(room_code, websocket)
    
    # Initialize VibeSync room state if this is the first client
    if room_code not in ACTIVE_VIBESYNC_ROOMS:
        ACTIVE_VIBESYNC_ROOMS[room_code] = {
            "room_code": room_code,
            "participants": [],
            "queue": [],
            "current_track": None,
            "playing": False,
            "progress": 0,
            "votes": {}, # video_id -> upvotes count
            "reactions": []
        }
        
    room = ACTIVE_VIBESYNC_ROOMS[room_code]
    
    # Add participant if not already present
    participant_id = f"user-{abs(hash(user_name + str(websocket.client))) % 100000}"
    participant = {
        "id": participant_id,
        "name": user_name,
        "avatar": f"avatar-{avatar_idx}"
    }
    
    if not any(p["name"] == user_name for p in room["participants"]):
        room["participants"].append(participant)
        
    # Broadcast current room state and connection notification
    join_notify = {
        "type": "USER_JOINED",
        "user": participant,
        "room_state": room,
        "message": f"{user_name} has joined the VibeSync Room!"
    }
    await vibesync_manager.broadcast(room_code, join_notify)
    
    try:
        while True:
            # Read dynamic event payloads from WS client
            data = await websocket.receive_json()
            action_type = data.get("action")
            
            if action_type == "ADD_SONG":
                track_item = data.get("track")
                if track_item:
                    # Avoid duplicate tracks inside the active listening queue
                    video_id = track_item.get("id", {}).get("videoId") or track_item.get("videoId")
                    if video_id and not any((t.get("id", {}).get("videoId") or t.get("videoId")) == video_id for t in room["queue"]):
                        # Inject upvote fields
                        room["votes"][video_id] = 0
                        track_item["upvotes"] = 0
                        room["queue"].append(track_item)
                        
                        await vibesync_manager.broadcast(room_code, {
                            "type": "QUEUE_UPDATED",
                            "queue": room["queue"],
                            "message": f"{user_name} added '{track_item['snippet']['title']}' to VibeSync!"
                        })
                        
            elif action_type == "REMOVE_SONG":
                video_id = data.get("videoId")
                if video_id:
                    room["queue"] = [t for t in room["queue"] if (t.get("id", {}).get("videoId") or t.get("videoId")) != video_id]
                    if video_id in room["votes"]:
                        del room["votes"][video_id]
                        
                    await vibesync_manager.broadcast(room_code, {
                        "type": "QUEUE_UPDATED",
                        "queue": room["queue"],
                        "message": f"{user_name} removed a song from the queue."
                    })
                    
            elif action_type == "UPVOTE_SONG":
                video_id = data.get("videoId")
                if video_id:
                    room["votes"][video_id] = room["votes"].get(video_id, 0) + 1
                    
                    # Update queue internal count attributes
                    for t in room["queue"]:
                        vid = t.get("id", {}).get("videoId") or t.get("videoId")
                        if vid == video_id:
                            t["upvotes"] = room["votes"][video_id]
                            
                    # Democratic dynamic sorting: highest upvotes first
                    room["queue"].sort(key=lambda x: x.get("upvotes", 0), reverse=True)
                    
                    await vibesync_manager.broadcast(room_code, {
                        "type": "QUEUE_UPDATED",
                        "queue": room["queue"],
                        "message": f"{user_name} upvoted a song!"
                    })
                    
            elif action_type == "SEND_REACTION":
                emoji = data.get("emoji", "🔥")
                reaction_payload = {
                    "type": "REACTION_RECEIVED",
                    "user_name": user_name,
                    "emoji": emoji,
                    "timestamp": data.get("timestamp")
                }
                await vibesync_manager.broadcast(room_code, reaction_payload)
                
            elif action_type == "PLAYER_SYNC":
                # Master synchronizer (sync playback speeds/seeks/states)
                room["playing"] = data.get("playing", False)
                room["progress"] = data.get("progress", 0)
                current_t = data.get("currentTrack")
                if current_t:
                    room["current_track"] = current_t
                    
                await vibesync_manager.broadcast(room_code, {
                    "type": "PLAYER_SYNCED",
                    "playing": room["playing"],
                    "progress": room["progress"],
                    "current_track": room["current_track"],
                    "sender_id": participant_id,
                    "message": f"Playback synced by {user_name}"
                })
                
    except WebSocketDisconnect:
        # Gracefully handle client disconnects
        vibesync_manager.disconnect(room_code, websocket)
        
        # Remove participant from dynamic roster
        room["participants"] = [p for p in room["participants"] if p["name"] != user_name]
        
        leave_notify = {
            "type": "USER_LEFT",
            "user_name": user_name,
            "participants": room["participants"],
            "message": f"{user_name} has left VibeSync."
        }
        await vibesync_manager.broadcast(room_code, leave_notify)
        
        # Free memory: delete the room dictionary if it becomes fully empty
        if not room["participants"] and room_code in ACTIVE_VIBESYNC_ROOMS:
            del ACTIVE_VIBESYNC_ROOMS[room_code]


# =====================================================================
# REAL-TIME GLOBAL ACTIVITY FEED SOCKETS
# =====================================================================
import sqlite3
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "vibe_feed.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            avatar TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vibe_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            username TEXT,
            user_avatar TEXT,
            activity_type TEXT,
            item_title TEXT,
            item_artist TEXT,
            item_cover TEXT,
            item_video_id TEXT,
            timestamp REAL,
            payload TEXT
        )
    """)
    # Delete legacy stream events to clean up the persistent feed
    cursor.execute("DELETE FROM vibe_activities WHERE activity_type = 'stream'")
    conn.commit()
    conn.close()


init_db()

def save_activity_to_db(data: dict):
    try:
        activity_type = data.get("type")
        user_id = data.get("userId") or "unknown_user"
        user_data = data.get("user") or {}
        username = user_data.get("name") or "Unknown User"
        user_avatar = user_data.get("avatar") or ""
        timestamp = data.get("timestamp") or time.time()
        
        item_title = ""
        item_artist = ""
        item_cover = ""
        item_video_id = ""
        db_activity_type = ""
        
        if activity_type == "FRIEND_LISTENING":
            # We don't persist currently playing streams in the database to prevent auto feed posts
            return
            
        elif activity_type == "PLAYLIST_UPDATION":
            db_activity_type = "playlist"
            playlist = data.get("playlist") or {}
            item_title = playlist.get("name") or "Curated Playlist"
            item_artist = playlist.get("description") or ""
            item_cover = playlist.get("covers", [None])[0] or ""
            item_video_id = ""
            
        elif activity_type == "FEED_BROADCAST":
            db_activity_type = "share"
            activity = data.get("activity") or {}
            user_data = activity.get("user") or user_data
            username = user_data.get("name") or username
            user_avatar = user_data.get("avatar") or user_avatar
            item_title = activity.get("caption") or ""
            song = activity.get("song") or {}
            item_artist = song.get("title") or ""
            item_cover = song.get("cover_url") or ""
            item_video_id = song.get("videoId") or ""
            
        elif activity_type == "SONG_LIKED":
            db_activity_type = "like"
            song = data.get("song") or {}
            item_title = song.get("title") or "Unknown Song"
            item_artist = song.get("artist") or "Unknown Artist"
            item_cover = song.get("cover_url") or ""
            item_video_id = song.get("videoId") or ""
        else:
            return

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO vibe_activities 
            (user_id, username, user_avatar, activity_type, item_title, item_artist, item_cover, item_video_id, timestamp, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            username,
            user_avatar,
            db_activity_type,
            item_title,
            item_artist,
            item_cover,
            item_video_id,
            timestamp,
            json.dumps(data)
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error saving activity to database: {e}")

@app.get("/api/activities")
def get_activities(limit: int = 50):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, user_id, username, user_avatar, activity_type, item_title, item_artist, item_cover, item_video_id, timestamp, payload 
            FROM vibe_activities 
            ORDER BY timestamp DESC 
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        activities = []
        for r in rows:
            payload_data = json.loads(r[10]) if r[10] else {}
            # Extract the frontend activity id from the payload so the frontend can use it for deletion
            activity_id = payload_data.get("activity", {}).get("id") or r[0]
            activities.append({
                "id": activity_id,        # frontend activity id (Date.now()) or db row id
                "dbId": r[0],             # SQLite autoincrement id
                "userId": r[1],
                "username": r[2],
                "userAvatar": r[3],
                "activityType": r[4],
                "itemTitle": r[5],
                "itemArtist": r[6],
                "itemCover": r[7],
                "itemVideoId": r[8],
                "timestamp": r[9],
                "payload": payload_data
            })
        return activities
    except Exception as e:
        print(f"Error fetching activities: {e}")
        return []

@app.delete("/api/activities/{activity_id}")
def delete_activity(activity_id: str):
    """Delete an activity by its frontend id (Date.now() stored in payload.activity.id)
    or by its SQLite row id. Returns 200 even if not found (idempotent)."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        deleted = 0

        # 1. Try exact match on payload JSON for the frontend activity id
        cursor.execute("SELECT id, payload FROM vibe_activities")
        rows = cursor.fetchall()
        ids_to_delete = []
        for row in rows:
            db_id = row[0]
            try:
                payload = json.loads(row[1]) if row[1] else {}
                frontend_id = payload.get("activity", {}).get("id")
                # Compare as strings to handle float/int differences
                if str(frontend_id) == str(activity_id) or str(db_id) == str(activity_id):
                    ids_to_delete.append(db_id)
            except Exception:
                pass

        for db_id in ids_to_delete:
            cursor.execute("DELETE FROM vibe_activities WHERE id = ?", (db_id,))
            deleted += cursor.rowcount

        conn.commit()
        conn.close()
        return {"status": "ok", "deleted": deleted, "activity_id": activity_id}
    except Exception as e:
        print(f"Error deleting activity {activity_id}: {e}")
        return {"status": "ok", "deleted": 0, "note": str(e)}

class ActivityFeedManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, payload: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(payload)
            except Exception:
                self.disconnect(connection)

activity_feed_manager = ActivityFeedManager()

@app.websocket("/api/ws/activity")
async def activity_websocket_endpoint(websocket: WebSocket):
    await activity_feed_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if "timestamp" not in data:
                data["timestamp"] = time.time() * 1000  # Convert to milliseconds for JS compatibility
            save_activity_to_db(data)
            await activity_feed_manager.broadcast(data)
    except WebSocketDisconnect:
        activity_feed_manager.disconnect(websocket)



# =====================================================================
# JWT AUTHENTICATION UTILITIES & ROUTING
# =====================================================================
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, avatar FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise credentials_exception

    return UserResponse(
        id=row[0],
        name=row[1],
        email=row[2],
        avatar=row[3] or ""
    )

@app.post("/api/auth/register", response_model=TokenResponse)
def register_user(user: UserRegister):
    user_email = user.email.strip().lower()
    if not user_email or not user.password:
        raise HTTPException(status_code=400, detail="Email and password cannot be empty.")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (user_email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    hashed_pwd = get_password_hash(user.password)
    avatar_url = f"https://api.dicebear.com/7.x/initials/svg?seed={user.name}"
    
    cursor.execute(
        "INSERT INTO users (name, email, hashed_password, avatar) VALUES (?, ?, ?, ?)",
        (user.name, user_email, hashed_pwd, avatar_url)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    user_resp = UserResponse(
        id=user_id,
        name=user.name,
        email=user_email,
        avatar=avatar_url
    )
    
    access_token = create_access_token(data={"sub": user_email})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_resp
    )

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(credentials: UserLogin):
    try:
        print(f"[LOGIN] Received credentials: email={credentials.email}, password_len={len(credentials.password)}")
        user_email = credentials.email.strip().lower()
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, hashed_password, avatar FROM users WHERE email = ?", (user_email,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            print(f"[LOGIN] User not found: {user_email}")
            raise HTTPException(status_code=400, detail="User not found. Please register first.")
        
        if not verify_password(credentials.password, row[3]):
            print(f"[LOGIN] Password verification failed for {user_email}")
            raise HTTPException(status_code=400, detail="Incorrect password.")

        print(f"[LOGIN] Login successful for {user_email}")
        user_resp = UserResponse(
            id=row[0],
            name=row[1],
            email=row[2],
            avatar=row[4] or ""
        )

        access_token = create_access_token(data={"sub": user_email})
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_resp
        )
    except HTTPException as e:
        print(f"[LOGIN] HTTPException: {e.status_code} - {e.detail}")
        raise
    except Exception as e:
        print(f"[LOGIN] Unexpected error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@app.get("/health")
def health_check():
    return {"status": "ok", "app": "MN Music Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

