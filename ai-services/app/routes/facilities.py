from fastapi import APIRouter

# emergency facilities & location router
router = APIRouter(prefix="/search", tags=["facilities"])

# helath centres & emergency hospital
FACILITIES_DATA = [
    {
        "id": "dh-sultanpur",
        "name": "District Hospital Sultanpur (जिला अस्पताल सुल्तानपुर)",
        "type": "District Hospital",
        "distance": "3.5 km",
        "address": "Civil Lines, Sultanpur, Uttar Pradesh",
        "phone": "+91-5362-240100",
        "emergency_24x7": True,
        "anti_venom_available": True,
        "blood_bank": True,
        "ambulance": "108"
    },
    {
        "id": "chc-dubeypur",
        "name": "Community Health Centre (CHC) Dubeypur",
        "type": "CHC",
        "distance": "6.2 km",
        "address": "Dubeypur Block, Sultanpur, Uttar Pradesh",
        "phone": "+91-9450000001",
        "emergency_24x7": True,
        "anti_venom_available": True,
        "blood_bank": False,
        "ambulance": "108"
    },
    {
        "id": "chc-kurebhar",
        "name": "Community Health Centre (CHC) Kurebhar",
        "type": "CHC",
        "distance": "12.0 km",
        "address": "Ayodhya-Prayagraj Highway, Kurebhar, Sultanpur",
        "phone": "+91-9450000002",
        "emergency_24x7": True,
        "anti_venom_available": True,
        "blood_bank": False,
        "ambulance": "108"
    },
    {
        "id": "phc-dhanpatganj",
        "name": "Primary Health Centre (PHC) Dhanpatganj",
        "type": "PHC",
        "distance": "14.8 km",
        "address": "Dhanpatganj, Sultanpur, Uttar Pradesh",
        "phone": "+91-9450000003",
        "emergency_24x7": False,
        "anti_venom_available": True,
        "blood_bank": False,
        "ambulance": "108"
    }
]

# returns list of nearby primary health facilities
@router.get("/facilities")   # [abhi STATIC h, API lga kr DYNAMIC kr sakte h (location ke basis pr)]
def get_facilities():
    return {
        "emergency_helpline": "108",
        "maternal_helpline": "102",
        "facilities": FACILITIES_DATA
    }
