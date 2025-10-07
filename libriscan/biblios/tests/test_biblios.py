from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from biblios.models import Series, Document, Organization, UserRole


class UserModelTests(TestCase):
    def setUp(self):
        pass

    def test_using_custom_user(self):
        """
        Libriscan should be using the custom User model
        """
        user_model = get_user_model()
        self.assertIs(user_model._meta.app_label, "biblios")


class BibliosTests(TestCase):
    fixtures = ["orgs", "collections", "series", "docs"]

    # The unique constraint tests are confirming that the constraints are applied as intended,
    # not that they generally work.

    def test_unique_docs(self):
        # Checking that the constraint isn't being applied across different series
        d = Document.objects.first()
        s = Series.objects.create(collection=d.series.collection, name="Test series")

        try:
            Document.objects.create(series=s, identifier=d.identifier)
            passes = True
        except IntegrityError:
            passes = False

        self.assertTrue(passes)

    def test_unique_user_roles(self):
        # Checking the constraint doesn't block a user from having different roles,
        # or different users from having the same role in an org
        user_model = get_user_model()
        u = user_model.objects.create(email="1@2.com")
        org = Organization.objects.first()
        UserRole.objects.create(user=u, organization=org, role=UserRole.EDITOR)

        try:
            new_user = user_model.objects.create(email="2@2.com")
            UserRole.objects.create(
                user=new_user, organization=org, role=UserRole.EDITOR
            )
            UserRole.objects.create(user=u, organization=org, role=UserRole.ARCHIVIST)
            passes = True
        except IntegrityError:
            passes = False

        self.assertTrue(passes)

    def test_login_is_reachable(self):
        # Checking that the login required middleware doesn't cause redirect loops when logging in
        from libriscan.settings import LOGIN_URL
        response = self.client.get(LOGIN_URL, follow=True)
        # The redirect should only be one hop
        self.assertEqual(len(response.redirect_chain), 1)
        # The page can be successfully reached
        self.assertEqual(response.status_code, 200)



# This is not the right place for this.
mock_extraction = """
[
    {
      "BlockType": "WORD",
      "Confidence": 97.08146667480469,
      "Text": "give,",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.04265840724110603,
          "Height": 0.014060212299227715,
          "Left": 0.6247768998146057,
          "Top": 0.19947728514671326
        },
        "Polygon": [
          {
            "X": 0.6247768998146057,
            "Y": 0.19947728514671326
          },
          {
            "X": 0.6673938632011414,
            "Y": 0.19956453144550323
          },
          {
            "X": 0.6674352884292603,
            "Y": 0.21353749930858612
          },
          {
            "X": 0.6248196959495544,
            "Y": 0.21345089375972748
          }
        ],
        "RotationAngle": 0
      },
      "Id": "b756619a-67c2-4b19-959b-06cab0568a19"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.609375,
      "Text": "grant,",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.04788142070174217,
          "Height": 0.01139664463698864,
          "Left": 0.6730210185050964,
          "Top": 0.20269350707530975
        },
        "Polygon": [
          {
            "X": 0.6730210185050964,
            "Y": 0.20269350707530975
          },
          {
            "X": 0.7208702564239502,
            "Y": 0.20279130339622498
          },
          {
            "X": 0.7209024429321289,
            "Y": 0.21409015357494354
          },
          {
            "X": 0.6730543971061707,
            "Y": 0.21399293839931488
          }
        ],
        "RotationAngle": 0
      },
      "Id": "98491e1b-1b2c-4399-9318-fad0c0ac1a50"
    },
    {
      "BlockType": "LNE",
      "Confidence": 97.08146667480469,
      "Text": "here's a new line,",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.04265840724110603,
          "Height": 0.014060212299227715,
          "Left": 0.6247768998146057,
          "Top": 0.19947728514671326
        },
        "Polygon": [
          {
            "X": 0.6247768998146057,
            "Y": 0.19947728514671326
          },
          {
            "X": 0.6673938632011414,
            "Y": 0.19956453144550323
          },
          {
            "X": 0.6674352884292603,
            "Y": 0.21353749930858612
          },
          {
            "X": 0.6248196959495544,
            "Y": 0.21345089375972748
          }
        ],
        "RotationAngle": 0
      },
      "Id": "67c2-4b19-959b-06cab0568a19-b756619a"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.521484375,
      "Text": "fell",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.02440023049712181,
          "Height": 0.010918735526502132,
          "Left": 0.724556028842926,
          "Top": 0.20062096416950226
        },
        "Polygon": [
          {
            "X": 0.724556028842926,
            "Y": 0.20062096416950226
          },
          {
            "X": 0.7489259839057922,
            "Y": 0.20067083835601807
          },
          {
            "X": 0.7489562630653381,
            "Y": 0.21153970062732697
          },
          {
            "X": 0.7245869040489197,
            "Y": 0.21149012446403503
          }
        ],
        "RotationAngle": 0
      },
      "Id": "a4e2e906-eb1d-4a6a-84f7-ca5e2d46e127"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.755859375,
      "Text": "and",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.029470747336745262,
          "Height": 0.010458322241902351,
          "Left": 0.7538689374923706,
          "Top": 0.2013992816209793
        },
        "Polygon": [
          {
            "X": 0.7538689374923706,
            "Y": 0.2013992816209793
          },
          {
            "X": 0.7833114862442017,
            "Y": 0.20145951211452484
          },
          {
            "X": 0.7833396792411804,
            "Y": 0.2118576169013977
          },
          {
            "X": 0.7538977861404419,
            "Y": 0.21179771423339844
          }
        ],
        "RotationAngle": 0
      },
      "Id": "b58a26a0-e0be-4671-9fb4-98e30885ff30"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.72576141357422,
      "Text": "convey",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.05552181974053383,
          "Height": 0.010697567835450172,
          "Left": 0.7884790897369385,
          "Top": 0.20464812219142914
        },
        "Polygon": [
          {
            "X": 0.7884790897369385,
            "Y": 0.20464812219142914
          },
          {
            "X": 0.8439736366271973,
            "Y": 0.20476144552230835
          },
          {
            "X": 0.8440008759498596,
            "Y": 0.21534568071365356
          },
          {
            "X": 0.7885076403617859,
            "Y": 0.2152329981327057
          }
        ],
        "RotationAngle": 0
      },
      "Id": "99d779f0-b359-4e62-b5f1-688a074e6bb0"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.65740203857422,
      "Text": "unto",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.03706052526831627,
          "Height": 0.009000927209854126,
          "Left": 0.8495942950248718,
          "Top": 0.20403790473937988
        },
        "Polygon": [
          {
            "X": 0.8495942950248718,
            "Y": 0.20403790473937988
          },
          {
            "X": 0.8866326808929443,
            "Y": 0.20411355793476105
          },
          {
            "X": 0.8866548538208008,
            "Y": 0.213038831949234
          },
          {
            "X": 0.8496171832084656,
            "Y": 0.2129635214805603
          }
        ],
        "RotationAngle": 0
      },
      "Id": "95641123-904c-43c3-ac5c-6e107a6f176f"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.794921875,
      "Text": "the",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.025576069951057434,
          "Height": 0.010416781529784203,
          "Left": 0.8918554782867432,
          "Top": 0.20296093821525574
        },
        "Polygon": [
          {
            "X": 0.8918554782867432,
            "Y": 0.20296093821525574
          },
          {
            "X": 0.9174064993858337,
            "Y": 0.20301316678524017
          },
          {
            "X": 0.9174315333366394,
            "Y": 0.2133777141571045
          },
          {
            "X": 0.8918810486793518,
            "Y": 0.21332578361034393
          }
        ],
        "RotationAngle": 0
      },
      "Id": "bef6197b-496c-427f-bc34-fe7b7b5ad0f4"
    },
    {
      "BlockType": "WORD",
      "Confidence": 99.84375,
      "Text": "faid",
      "TextType": "PRINTED",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.03041054494678974,
          "Height": 0.010779935866594315,
          "Left": 0.9218835830688477,
          "Top": 0.20287635922431946
        },
        "Polygon": [
          {
            "X": 0.9218835830688477,
            "Y": 0.20287635922431946
          },
          {
            "X": 0.9522690773010254,
            "Y": 0.20293846726417542
          },
          {
            "X": 0.952294111251831,
            "Y": 0.21365629136562347
          },
          {
            "X": 0.9219093322753906,
            "Y": 0.21359452605247498
          }
        ],
        "RotationAngle": 0
      },
      "Id": "e2e256d9-d594-4c59-b062-2db86194b08a"
    },
    {
      "BlockType": "WORD",
      "Confidence": 97.4463882446289,
      "Text": "situate",
      "TextType": "HANDWRITING",
      "Geometry": {
        "BoundingBox": {
          "Width": 0.09900590032339096,
          "Height": 0.017461547628045082,
          "Left": 0.12682507932186127,
          "Top": 0.23788948357105255
        },
        "Polygon": [
          {
            "X": 0.12682507932186127,
            "Y": 0.23788948357105255
          },
          {
            "X": 0.22576291859149933,
            "Y": 0.23808784782886505
          },
          {
            "X": 0.22583097219467163,
            "Y": 0.2553510367870331
          },
          {
            "X": 0.1268969029188156,
            "Y": 0.2551545202732086
          }
        ],
        "RotationAngle": 0
      },
      "Id": "9a3baf2c-859a-4537-92df-34d213270d6d"
    }
]
"""
